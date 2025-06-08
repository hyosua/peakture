    // services/assignPoints.js

import User from "../models/user.model.js"
import Photo from "../models/photo.model.js";
import Album from "../models/album.model.js";
import Guest from "../models/guest.model.js";
import { sendTieNotification } from "../lib/utils/sendEmail.js";

export const getClassementPhotos = async (albumId) => {
    if(!albumId) {
        throw new Error("Album ID is required to get classement photos");
    }
    const classementPhotos = await Photo.find({ albumId }).sort({ votes: -1 });
    return classementPhotos;
}

export const getWinResult = (photos) => {
    if(!photos || photos.length === 0) {
        throw new Error("No photos available to determine a winner");
    }
    const winningPhoto = photos[0];
    const tiePhotos = photos.filter(photo => photo.votes === winningPhoto.votes);
    if (tiePhotos.length > 1) {
        return { isTie: true, tiePhotos };
    }
    return { isTie: false, winningPhoto };
}

export const determineUserOrGuest = async (userId) => {

    const user = await User.findById(userId);
    if (user) {
        return { model: 'User', user };
    }
    const guest = await Guest.findById(userId);
    if (guest) {
        return { model: 'Guest', guest };
    }
    return { model: null, user: null };
}

export const resolveTie = async (tiePhotos, albumId, familyId) => {
    const lastClosedAlbum = await Album.findOne(
            { familyId, status: "closed" }
    ).sort({ createdAt: -1 });
    console.log("Last winner:", lastClosedAlbum.winnerId);
    const lastWinner = await determineUserOrGuest(lastClosedAlbum.winnerId);

    if (shouldResolveTieWithPreviousWinner(lastWinner, tiePhotos)) { 
        const tieBreakResult = await setTieBreak(lastWinner.user, albumId, tiePhotos);
        if (!tieBreakResult) {
            throw new Error("Failed to set tie break");
        }
        return {
            updatedAlbum: tieBreakResult.pendingTieAlbum,
            updatedTiedPhotos: tieBreakResult.updatedTiedPhotos,
            manualTieBreak: true,
            tieJudge: lastWinner,
        };
    }
    // Si le gagnant précédent n'est pas un User ou est finaliste, on choisit un gagnant aléatoire
    const winningPhoto = assignRandomWinningPhoto(tiePhotos);
    const updatedWinningPhoto = await Photo.findByIdAndUpdate(
        winningPhoto._id,
        { $inc: { votes: 1 } },
        { new: true }
    );
    return {
        manualTieBreak: false,
        winningPhoto: updatedWinningPhoto,
        winnerId: winningPhoto.userId
    };
    
}

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
    if(!photos || photos.length < 2) return false; // Pas de photos à vérifier
    try {
        // Récupérer les photos triées par nombre de votes décroissant
        const sortedPhotos = photos.sort((a, b) => b.votes - a.votes);
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

// détermine si le gagnant précédant est un User et n'est pas finaliste dans les photos à départager
export const shouldResolveTieWithPreviousWinner =  (lastWinner, tiedPhotos) => {    
    return lastWinner.model === 'User' && !tiedPhotos.some(photo => photo.userId.toString() === lastAlbum.winnerId.toString());
}

export const assignWinnerRandomly = async (albumId, tiePhotos) => {
    const winningPhoto =  assignRandomWinningPhoto(tiePhotos);
    
    const updatedWinningPhoto = await Photo.findByIdAndUpdate(
        winningPhoto._id,
        { $inc: { votes: 1 } },
        { new: true }
    );
    
    const updatedAlbum = await Album.findOneAndUpdate(
        { _id: albumId },
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

export const closeAlbumService = async (albumId, familyId) => {
    if (!albumId || !familyId) {
        throw new Error ("Album ID and Family ID are required to close an album");
    }
    const classementPhotos = await getClassementPhotos(albumId);
    if (!classementPhotos || classementPhotos.length === 0) {
        throw new Error("No photos found for the album to determine a winner");
    }
    let { isTie, winningPhoto, tiePhotos } = getWinResult(classementPhotos);
    let isRandomWinner = false;

    if (isTie) {
        const tieResult = await resolveTie(tiePhotos, albumId, familyId);
        if (tieResult.manualTieBreak) {
            return {
                status: "tie-break",
                tieJudge: tieResult.tieJudge,
                message: `Le précédent vainqueur (${tieResult.tieJudge.user.name}) doit départager les finalistes.`,
                updatedAlbum: tieResult.updatedAlbum,
            }
        }
        isRandomWinner = true;
        winningPhoto = tieResult.winningPhoto;
    }

    const { model: userModel, user: winner } = await determineUserOrGuest(winningPhoto.userId);
    if (!winner) {
        throw new Error("Winner not found");
    }
    let updatedAlbum = await Album.findByIdAndUpdate(
        albumId,
        {
            $set: {
                winnerId: winner._id,
                winnerModel: userModel,
                peakture: winningPhoto._id,
                status: "closed",
                cover: winningPhoto.src,
                isRandomWinner
            }
        },
        { new: true }
    );
    updatedAlbum = await updatedAlbum.populate([
        { path: 'winnerId' },
        { path: 'peakture' }
    ]);

    if (!updatedAlbum) {
        throw new Error("Failed to update album with winner information");
    }

    await assignPoints(classementPhotos);

    return {
        winner,
        updatedAlbum,
        status: "closed"
    }
}