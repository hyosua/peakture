import User from "../models/user.model.js"
import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import { ObjectId } from "mongodb";
import cloudinary from "../cloudinaryConfig.js"
import mongoose from "mongoose";
import { sendTieNotification } from "../lib/utils/sendEmail.js";


export const getAlbum = async (req, res) => {
    try {
        const album = await Album.findOne({
            _id: req.params.id
        });
        
        if (!album) {
            return res.status(404).json({ message: 'Album non trouvé' });
        }
        
        res.json(album);
    } catch (error) {
        console.error('Error fetching album:', error);
        res.status(500).json({ message: 'Error fetching album', error: error.message });
    }
}

export const createAlbum = async (req, res) => {
    try {
        if(await Album.findOne({familyId: req.body.familyId, month: req.body.month})){
            return res.status(404).json({ message: "Il y'a déjà un album pour ce mois" })
        }
        let newDocument = {
            month: req.body.month,
            theme: req.body.theme,
            familyId: req.body.familyId
        };
        const result = await Album.create(newDocument);
        res.status(201).send(result);
    } catch(err) {
        console.error(err);
        res.status(500).send("Erreur lors de la création de l'album");
    }
}

export const editAlbum = async (req, res) => {
    try {      
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                theme: req.body.theme
            },
        };
        
        const result = await Album.updateOne(query, updates);

        // Send back the updated document
        if(result.matchedCount === 0) {
            console.log(`No album found with id: ${req.params.id}`);
            return res.status(404).send("Aucun album n'existe avec cet id.");
        }

        // Get the updated document
        const updatedAlbum = await Album.findOne(query);

        res.status(200).json({
            success: true,
            message: "Le thème a bien été mis à jour",
            updatedAlbum
        });
    } catch (error) {
        console.error('Error updating album:', error);
        res.status(500).json({ message: 'Error updating album', error: error.message });
    }
}

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

        return res.status(200).json({
            winner,
            updatedAlbum
        });

    } catch (error) {
        console.error('Error in handleTie Controller:', error);
        res.status(500).json({ message: 'Erreur pour trouver un gagnant:', error: error.message });
    }
}


export const deleteAlbum = async (req, res) => {
    try {
        
        const albumId = req.params.id

        await Photo.deleteMany({
            albumId
        })
        
        const query = { _id: new ObjectId(albumId) };

        const result = await Album.deleteOne(query);

        if (result.deletedCount === 0){
            return res.status(404).send("No album found with that id");
        }
   
        res.status(200).send(result)
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting album");
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

        return res.json(closedAlbum)
    }catch(error){
        console.error("Erreur dans Close Album route:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}



export const deleteAlbumFromCloudinary = async (req, res) => {
    try {
        const albumId = req.params.id

        const photos = await Photo.find({
            albumId
        })
    
        const cloudinaryIds = photos.map((photo) => {
            return photo.src.split('/').pop().split('.')[0]
        })
    
        const deletionPromises = cloudinaryIds.map((publicId) => {
            return cloudinary.uploader.destroy(publicId)
        })
    
        await Promise.all(deletionPromises)
    
        res.status(200).json({
            message: `Toutes les photos (${photos.length} de l'album ont été supprimées avec succès)`
        })
    } catch (error){
        res.status(500).json({ message: "Erreur dans album.controller lors de la suppression des photos sur cloudinary: ",error})
    }
}