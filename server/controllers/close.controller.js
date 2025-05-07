import User from "../models/user.model.js"
import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import { ObjectId } from "mongodb";
import cloudinary from "../cloudinaryConfig.js"
import mongoose from "mongoose";
import { sendTieNotification } from "../lib/utils/sendEmail.js";
import { assignPoints } from "../services/album.service.js";
import Guest from "../models/guest.model.js";

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
        // On vérifie si le gagnant est un utilisateur ou un invité
        let userModel = 'User';
        let winner = await User.findById(winningPhoto.userId);
        if (!winner) {
            winner = await Guest.findById(winningPhoto.userId);
            userModel = 'Guest';
            if (!winner) {
                console.log("Aucun gagnant trouvé");
                return res.status(404).json({ message: "Gagnant non trouvé" });
            }
        }
        
        const result = await Album.findByIdAndUpdate(
            req.params.id, 
            { $set: { winner: winningPhoto.userId, userModel: userModel, peakture: winningPhoto._id, cover: winningPhoto.src }},
            { new: true }
        )
        const populatedResult = await Album.findById(req.params.id)
        .populate('winner')
        .populate('peakture');

        if(!populatedResult) {
            console.log("Erreur lors de l'ajout du winner")
            return res.status(404).json({ message: "Album non trouvé" });
        }

        res.status(200).json({
            updatedAlbum: populatedResult, 
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

        // Vérifier si on a un album précédent et si le winner n'est pas parmi les finalistes
        if (lastClosedAlbum) {
            // Vérifier si le dernier gagnant est un Guest
            let lastWinner = await Guest.findById(lastClosedAlbum.winner);
            const isGuest = lastWinner !== null;
            
            // Si ce n'est pas un Guest, chercher dans User
            if (!isGuest) {
                lastWinner = await User.findById(lastClosedAlbum.winner);
            }
            
            const lastWinnerIsFinalist = tiePhotos.some(photo => 
                photo.userId.toString() === lastClosedAlbum.winner.toString()
            );

            // Si le dernier gagnant n'est pas finaliste ET n'est pas un Guest, lui demander de départager
            if (!lastWinnerIsFinalist && !isGuest) {
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
                    message: `Le précédent vainqueur (${lastWinner.username}) doit départager les finalistes.`,
                    pendingAlbum: pendingTieAlbum
                });
            }
            
            // Si le dernier gagnant est un Guest OU est finaliste, faire un tirage au sort
            // On continue l'exécution vers le tirage au sort
        }

        // Tirage au sort
        const indexGagnant = Math.floor(Math.random() * tiePhotos.length);
        const winningPhoto = tiePhotos[indexGagnant];

        const updatedWinningPhoto = await Photo.findByIdAndUpdate(
            winningPhoto._id,
            { $inc: { votes: 1 } },
            { new: true }
        );

        // Déterminer si le gagnant est un User ou un Guest
        let userType = 'User';
        let winner = await User.findById(winningPhoto.userId);
        if (!winner) {
            winner = await Guest.findById(winningPhoto.userId);
            if (winner) {
                userType = 'Guest';
            }
        }

        const updatedAlbum = await Album.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    winner: winningPhoto.userId,
                    userModel: userType,
                    isRandomWinner: true,
                    peakture: updatedWinningPhoto._id,
                    status: "closed",
                    cover: updatedWinningPhoto.src
                }
            },
            { new: true }
        ).populate({
            path: 'winner',
            refPath: 'userModel'
        }).populate('peakture');

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
        console.log("Classement photos:", classementPhotos)

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
