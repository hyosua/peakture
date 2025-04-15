import User from "../models/user.model.js"
import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import { ObjectId } from "mongodb";
import cloudinary from "../cloudinaryConfig.js"
import mongoose from "mongoose";
import { sendTieNotification } from "../lib/utils/sendEmail.js";
import { assignPoints } from "../services/album.service.js";

export const getWinner = async (req, res) => {
    try {      
        
        const classementPhotos = await Photo.find({albumId: req.params.id}).sort({ votes: -1 })

        if(!classementPhotos || classementPhotos.length === 0){
            return res.status(404).send("Aucun winner")
        }

        if(classementPhotos[0].votes === classementPhotos[1]?.votes){
            return res.status(400).json({ message: "égalité" })
        }

        const winningPhoto = classementPhotos[0]
        const winner = await User.findById(winningPhoto.userId);
        if (!winner) {
            return res.status(404).json({ message: "Utilisateur gagnant non trouvé" });
        }
        
        const result = await Album.findByIdAndUpdate(
            req.params.id, 
            { $set: { winner: winningPhoto.userId, peakture: winningPhoto._id }},
            { new: true }
        ).populate('winner').populate('peakture')

        if(!result) {
            console.log("Erreur lors de l'ajout du winner")
            return res.status(404).json({ message: "Album non trouvé" });
        }

        // Mettre à jour l'album cover'
        await Album.updateOne(
            {_id: req.params.id}, 
            { $set: { cover: winningPhoto.src } }
        )

        const albumUpdated = await Album.findById({ _id: req.params.id })

        res.status(200).json({
            updatedAlbum: result, 
            classementPhotos
        })

    } catch (error) {
        console.error('Error in winner route:', error);
        res.status(500).json({ message: 'Erreur pour trouver un gagnant:', error: error.message });
    }
}

export const handleTie = async (req, res) => {
    try {      
        const classementPhotos = await Photo.find({ albumId: req.params.id }).sort({ votes: -1 });
        const tiePhotos = classementPhotos.filter(photo => photo.votes === classementPhotos[0].votes);
        const { familyId } = req.body;

        // Si pas d'égalité, inutile de continuer
        if (tiePhotos.length <= 1) {
            return res.status(400).json({ message: "Pas d'égalité détectée." });
        }

        const lastClosedAlbum = await Album.findOne(
            { familyId, status: "closed" }
        ).sort({ createdAt: -1 });

        if (lastClosedAlbum) {
            const lastWinner = await User.findById(lastClosedAlbum.winner);
            const lastWinnerIsFinalist = tiePhotos.some(photo => photo.userId.toString() === lastClosedAlbum.winner.toString());

            if (!lastWinnerIsFinalist) {
                await sendTieNotification(
                    lastWinner.email,
                    lastWinner.username,
                    req.params.id
                );

                const updatedTiedPhotos = await Photo.updateMany(
                    { _id: { $in: tiePhotos.map(photo => photo._id) } },
                    { $set: { isTied: true } }
                );

                const pendingTieAlbum = await Album.findByIdAndUpdate(
                    req.params.id,
                    { $set: { status: "tie-break", tieBreakJudge: lastWinner._id } },
                    { new: true }
                );

                if (!pendingTieAlbum) {
                    return res.status(404).json({ message: "Album non trouvé" });
                }

                return res.status(200).json({
                    message: `Le précédent vainqueur (${lastWinner.name}) doit départager les finalistes.`,
                    pendingAlbum: pendingTieAlbum
                });
            }
        }

        // Sinon, tirage au sort
        const indexGagnant = Math.floor(Math.random() * tiePhotos.length);
        const winningPhoto = tiePhotos[indexGagnant];

        const updatedWinningPhoto = await Photo.findByIdAndUpdate(
            winningPhoto._id,
            { $inc: { votes: 1 } },
            { new: true }
        );

        const winner = await User.findById(winningPhoto.userId);

        const updatedAlbum = await Album.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    winner: winningPhoto.userId,
                    peakture: updatedWinningPhoto._id,
                    status: "closed",
                    cover: updatedWinningPhoto.src
                }
            },
            { new: true }
        ).populate('winner').populate('peakture');

        if (!updatedAlbum) {
            return res.status(404).json({ message: "Erreur lors de la fermeture de l'album" });
        }

        // Mettre à jour les photos restantes pour qu'elles ne soient plus en égalité
        await Photo.updateMany(
            { _id: { $in: tiePhotos.map(photo => photo._id) } },
            { $set: { isTied: false } }
        );
        // Mettre à jour le classement
        const updatedClassementPhotos = await Photo.find({ albumId: req.params.id }).sort({ votes: -1 });
        await assignPoints(updatedClassementPhotos);

        return res.status(200).json({
            winner,
            updatedAlbum
        });

    } catch (error) {
        console.error('Error in handleTie Controller:', error);
        res.status(500).json({ message: 'Erreur pour trouver un gagnant:', error: error.message });
    }
}

export const closeVotes = async (req, res) => {
    try{    
        const albumId = req.params.id
        const album = await Album.findById(albumId)
        const classementPhotos = await Photo.find({albumId}).sort({ votes: -1 });
        const tiePhotos = classementPhotos.filter(photo => photo.votes === classementPhotos[0].votes);

        if (tiePhotos.length > 1) {
            return res.status(400).json({ error: "égalité" });
        }

        if(!album){
            return res.status(404).json({ error: "Album non trouvé"})
        }

        const closedAlbum = await Album.findByIdAndUpdate( 
            albumId, 
            { $set: {status : "closed" }},
            { $new: true }
        )

        await assignPoints(classementPhotos)
        return res.json(closedAlbum)
    }catch(error){
        console.error("Erreur dans Close Album route:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}

export const tieBreak = async (req,res) => {
    try{
        const photoId = req.params.id
        const userId = req.user._id
        const {albumId} = req.body

        const peakture = await Photo.findByIdAndUpdate(
            { _id: photoId },
            { $inc: { votes: 1 }},
            { new: true }
        )

       const updatedAlbum = await Album.findByIdAndUpdate(
            { _id: albumId },
            { $set: { winner: peakture.userId, peakture: peakture._id, status: "closed", cover: peakture.src }},
            { new: true }
        )

        const classementPhotos = await Photo.find({albumId}).sort({ votes: -1 });
        await assignPoints(classementPhotos)
        // Mettre à jour les photos restantes pour qu'elles ne soient plus en égalité
        await Photo.updateMany(
            { albumId },
            { $set: { isTied: false } }
        );

        return res.status(200).json({
            message: "Le vainqueur a été choisi",
            album: updatedAlbum,
            peakture
        })

    }catch(error){
        console.error("Erreur dans le tie break (photos controller):", error)
        return res.status(500).json({ message: "Erreur interne du serveur." })
    }
}
