import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import { closeAlbumService, assignPoints, determineUserOrGuest } from "../services/closeAlbum.service.js";

export const closeAlbum = async (req, res) => {
    try {
        const result = await closeAlbumService(req.params.id, req.body.familyId);
        if(result.status === 'tie-break'){
            return res.status(200).json({
                message: result.message,
                tieJudge: result.tieJudge,
                updatedAlbum: result.updatedAlbum
            });
        }

        return res.status(200).json({
            message: "Album clotûré",
            winner: result.winner,
            updatedAlbum: result.updatedAlbum
        })
    }catch (error){
        console.error("Erreur dans close.controller :", error);
        return res.status(500).json({ error: error.message });

    }
}

export const tieBreakVote = async (req,res) => {
    try{
        const photoId = req.params.id
        const userId = req.user._id
        const { model: userModel } = await determineUserOrGuest(userId);
        const {albumId} = req.body

        const peakture = await Photo.findByIdAndUpdate(
            { _id: photoId },
            { $inc: { votes: 1 }},
            { new: true }
        )

       const updatedAlbum = await Album.findByIdAndUpdate(
            { _id: albumId },
            { $set: { winnerId: peakture.userId, peakture: peakture._id, status: "closed", cover: peakture.src, winnerModel: userModel }},
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

export const setCountdown = async (req, res) => {
    try {      
        const { days } = req.body;
        const countdownDate = new Date(Date.now() + days * 60 * 1000); // 24 * 60 * 60 * 1000 = 24 hours in milliseconds

        const updatedAlbum = await Album.findByIdAndUpdate(
            req.params.id,
            { $set: { countdownDate, status: "countdown" } },
            { new: true }
        );

        if (!updatedAlbum) {
            return res.status(404).json({ message: "Album non trouvé" });
        }

        res.status(200).json({
            success: true,
            message: `Compte à rebours enclenché pour ${days} jour${days > 1 ? "s" : ""}`,
            updatedAlbum
        });
    } catch (error) {
        console.error('Error setting album countdown:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la configuration du compte à rebours', error: error.message });
    }
}
