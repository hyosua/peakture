import User from "../models/user.model.js"
import Guest from "../models/guest.model.js"
import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import { ObjectId } from "mongodb";
import cloudinary from "../cloudinaryConfig.js"
import { isClosed, isCountdown, isCountdownActive } from "../services/album.service.js";
import { closeAlbumService } from "../services/closeAlbum.service.js";
import { closeAlbum } from "./close.controller.js";

export const getAlbum = async (req, res) => {
    try {
        let album = await Album.findById(req.params.id);

        if (!album) {
            return res.status(404).json({ message: 'Album non trouvé' });
        }
        const now = new Date();
        // Vérifie si l'album est en countdown et si la date de countdown est passée
        if (album.status === 'countdown' && album.countdownDate < now) {
            await closeAlbumService(album._id, album.familyId);
            album = await Album.findById(req.params.id);
        }

        // Populate uniquement si winnerId et winnerModel sont définis
        if (album.status === 'closed' && album.winnerId && album.winnerModel) {
            await Album.findById(req.params.id).populate([
                { path: 'winnerId' },
                { path: 'peakture' }
            ]);
        }
        res.json(album);
    } catch (error) {
        console.error('Error fetching album:', error);
        res.status(500).json({ message: 'Error fetching album', error: error.message });
    }
}

export const createAlbum = async (req, res) => {
    try {
        const { familyId, month, theme, description, admin } = req.body
        const year = new Date().getFullYear()

        if(await Album.findOne({familyId, month, year})){
            return res.status(404).json({ message: "Il y'a déjà un album pour ce mois" })
        }
        let newDocument = {
            year,
            month,
            familyId,
            theme,
            description,
            admin
        };
        const result = await Album.create(newDocument);
        res.status(201).send(result);
    } catch(err) {
        console.error(err);
        res.status(500).send("Erreur lors de la création de l'album");
    }
}

export const editAlbumDescription = async (req, res) => {
    try {
        const update = req.body
        console.log("update description", update)
        console.log("id album", req.params.id)
        const updatedDescription = await Album.findByIdAndUpdate(req.params.id, update, {
            new : true,
            runValidators: true, // Verifie le format défini dans le schéma mongoose
        })
        return res.status(200).json({ success: true, message: "La description a bien été modifiée", updatedDescription })
    } catch (error) {
        console.error("Erreur dans Album Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}

export const editAlbumTheme = async (req, res) => {
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