    // services/assignPoints.js

import User from "../models/user.model.js"
import Photo from "../models/photo.model.js";
import Album from "../models/album.model.js";
import Guest from "../models/guest.model.js";
import { sendTieNotification } from "../lib/utils/sendEmail.js";

export const assignPoints = async (photos) => {
    try{
        if(!photos || photos.length === 0) return;

        const userPoints = {};
    
        for (const photo of photos) {
    
            const points = photo.votes * 3 +2; // 2 points pour la participation + 3 points par vote
    
            userPoints[photo.userId] = (userPoints[photo.userId] || 0) + points;
        }
        // Attribution de points supplémentaires pour les votants
        photos.forEach(photo => {
            if(photo.votedBy.length > 0) {
                photo.votedBy.forEach(voterId => {
                    userPoints[voterId] = (userPoints[voterId] || 0) + 1; // 1 point par vote   
                })
            }
        })
    
    
        const updates = Object.keys(userPoints).map(userId => ({
            updateOne: {
              filter: { _id: userId },
              update: { $inc: { score: userPoints[userId] } },
            }
        }));     
        
        // Exécuter la mise à jour
        await User.bulkWrite(updates);
        console.log('Points assignés avec succès');
    }catch (error) {
        console.error("ERROR in assignPoints:", error);
        console.error("Stack trace:", error.stack);
        throw error; // Re-throw the error after logging
    }

   
}

export const checkTie =  (photos) => {
    try {
        // Récupérer les photos triées par nombre de votes décroissant
        const sortedPhotos = photos.sort((a, b) => b.votes - a.votes);
        if (photos.length < 2) return false; // Pas assez de photos pour un tie
        const tiePhotos = sortedPhotos.filter(photo => photo.votes === sortedPhotos[0].votes);
        return tiePhotos.length > 1;
    } catch (error) {
        console.error("ERROR in checkTie:", error);
        console.error("Stack trace:", error.stack);
        throw error; // Re-throw the error after logging
    }
}

export const assignRandomWinningPhoto = (photos) => {
    try {
        if (!photos || photos.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * photos.length);
        return photos[randomIndex];
    }catch (error) {
        console.error("ERROR in assignRandomWinner:", error);
        console.error("Stack trace:", error.stack);
        throw error; // Re-throw the error after logging
    }
}

export const getUserOrGuestById = async (id) => {
    return await User.findById(id) || await Guest.findById(id);
}

export const setTieBreak = async (lastWinner, albumId, tiePhotos) => {
    await sendTieNotification(
        lastWinner.email,
        lastWinner.name,
        albumId
    );

    const updatedTiedPhotos = await Photo.updateMany(
        { _id: { $in: tiePhotos.map(photo => photo._id) } },
        { $set: { isTied: true } }
    );

     const pendingTieAlbum = await Album.findByIdAndUpdate(
        albumId,
        {
            status: "tie-break",
            tieBreakJudge: lastWinner._id
        },
        { new: true }
    );

    if (!pendingTieAlbum) {
        throw new Error("Failed to update album status to tie-break");
    }

    return {
        updatedTiedPhotos,
        pendingTieAlbum
    };
}

// détermine s'il existe un gagnant précédant qui n'est pas finaliste dans les photos à départager
export const shouldResolveTieWithPreviousWinner =  (lastAlbum, tiedPhotos) => {    
    return lastAlbum && !tiedPhotos.some(photo => photo.userId.toString() === lastAlbum.winnerId.toString());
}

export const assignWinnerRandomly = async (albumId, tiePhotos) => {
    const winningPhoto =  assignRandomWinningPhoto(tiePhotos);
    
    const updatedWinningPhoto = await Photo.findByIdAndUpdate(
        winningPhoto._id,
        { $inc: { votes: 1 } },
        { new: true }
    );
    
    const updatedAlbum = await Album.findByIdAndUpdate(
        albumId,
        {
            $set: {
                winnerId: winningPhoto.userId,
                peakture: updatedWinningPhoto._id,
                status: "closed",
                cover: updatedWinningPhoto.src
            }
        },
        { new: true }
    ).populate('winnerId').populate('peakture');

    return {
        winnerId: winningPhoto.userId,
        updatedAlbum
    }
}