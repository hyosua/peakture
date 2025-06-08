import User from "../models/user.model.js"
import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import mongoose from "mongoose";
import { sendTieNotification } from "../lib/utils/sendEmail.js";
import { closeAlbumService } from "../services/closeAlbum.service.js";
import { assignPoints } from "../services/album.service.js";
import Guest from "../models/guest.model.js";

export const closeAlbum = async (req, res) => {
    try {
        const result = await closeAlbumService(req.params.id, req.body.familyId);
        if(result.status === 'tie-break'){
            return res.status(200).json({
                message: result.message,
                tieJudge: result.tieJudge,
                album: result.updatedAlbum
            });
        }

        return res.status(200).json({
            message: "Album clotûré",
            winner: result.winner,
            album: result.updatedAlbum
        })
    }catch (error){
        console.error("Erreur dans close.controller :", error);
        return res.status(500).json({ error: error.message });

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
