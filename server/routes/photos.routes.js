import express from "express"
import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import { ObjectId } from "mongodb"
import cloudinary from "../cloudinaryConfig.js"

const router  = express.Router()

// Récupérer les photos d'un album
router.get('/:albumId', async (req, res) => {
    try {

        let albumId;
        try {
            albumId = new ObjectId(req.params.albumId);
        } catch (error) {
            return res.status(400).json({ message: "Invalid album ID format" });
        }

        const photos = await Photo.find({
            albumId: albumId.toString()
        })

        res.json({photos});

    } catch (err){
        console.log("Error fetching photos:", err)
        res.status(500).json({ message: "Error fetching photos ",error: err.message })
    }
})

// Ajouter une photo dans l'album
router.post('/', async (req, res) => {
    try {
        const { albumId, src, user } = req.body

        if( !albumId || !src ) {
            return res.status(400).json({message: "Album Id and Image URL are required" })
        }

        // Ajout de la photo
        const photoData = {
            albumId,
            src,
            votes: 0,
            user,
            createdAt: new Date()
        }
        const result = await Photo.create(photoData)

        // Récupération de la photo 
        let insertedPhoto
        if (result._id) {
            insertedPhoto = result
        }

        // MAJ de l'album cover si absent
        const album = await Album.findOne({
            _id: new ObjectId(albumId) 
        })

        if(!album.cover){
            await Album.updateOne(
                {_id: new ObjectId(albumId) },
                { $set: {cover: src} }
            )
        }

        res.status(201).json(insertedPhoto)
    } catch(error) {
        console.log('Error adding photo:', error)
        res.status(500).json({ message: 'Error adding photo', error: error.message})
    }
})

router.delete('/:id', async (req, res) => {

    try {
        // on valide d'abord le format de l'id de la photo
        let photoId;
        try {
            photoId = new ObjectId(req.params.id)
        } catch (error) {
            return res.status(400).json({ message: "Invalid photo ID format" });
        }

        // récupération de la photo
        const photo = await Photo.findOne({ _id: photoId });
        
        if (!photo) {
            return res.status(404).json({ message: "Photo not found" });
        }

        // Vérif du format d'album Id
        let albumObjectId;
        try {
            albumObjectId = new ObjectId(photo.albumId);
        } catch (error) {
            return res.status(500).json({ message: "Invalid album ID format in photo document" });
        }

        // suppression de la photo
        const deleteResult = await Photo.deleteOne({ _id: photoId });
        
        if (deleteResult.deletedCount === 0) {
            return res.status(500).json({ message: "Failed to delete photo" });
        }

        // Vérif si la photo était une cover
        const albumCover = await Album.findOne({
            _id: albumObjectId,
            cover: photo.src
        });

        // Si nécessaire MAJ de la cover de l'album
        if (albumCover) {
            const otherPhoto = await Photo.findOne({
                albumId: photo.albumId,
                _id: { $ne: photoId }
            });

            const updateOperation = otherPhoto 
                ? { $set: { cover: otherPhoto.src } }
                : { $unset: { cover: "" } };

            const albumUpdateResult = await Album.updateOne(
                { _id: albumObjectId },
                updateOperation
            );

            if (albumUpdateResult.matchedCount === 0) {
                console.warn(`Album ${albumObjectId} not found while updating cover`);
            }
        }

        res.json({ 
            message: 'Photo deleted successfully',
            photoId: photoId.toString(),
            albumUpdated: albumCover ? true : false,
        });

    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ 
            message: 'Internal server error while deleting photo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Supprimer une photo de Cloudinary
router.post('/cloudinary/delete', async (req,res) => {
    try {
        const { src } = req.body

        if (!src) {
            return res.status(400).json({
                message: "URL Cloudinary manquante"
            })
        }   

        // Extraction de l'id public cloudinary à partir de l'URL
        const publicId = src.split('/').pop().split('.')[0]

        // Suppression de l'image sur Cloudinary
        try {
            const cloudinaryResult = await cloudinary.uploader.destroy(publicId)
            if (cloudinaryResult.result !== 'ok') {
                return res.status(500).json({
                    message: "Erreur en supprimant de Cloudinary",
                    cloudinaryError: cloudinaryResult.result
                })
            }
        } catch (cloudinaryError){
            console.error('Cloudinary deletion error:', cloudinaryError)
            return res.status(500).json({
                message: "Error deleting from Cloudinary",
                error: cloudinaryError.message
            })
        }

        res.status(200).json({ 
            message: 'Photo deleted successfully from Cloudinary',
        });

    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ 
            message: 'Internal server error while deleting photo from Cloudinary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
})

router.post('/cloudinary/delete/:id', async (req, res) => {
    try {
        const albumId = req.params.id

        const photos = await Photo.find({
            albumId
        })
    
        if(!photos || photos.length === 0){
            return res.status(404).json({ message: "Aucune photo trouvée dans cet album "})
        }
    
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
        res.status(500).json({ message: "Erreur lors de la suppression des photos sur cloudinary: ",error})
    }
})

// Modifier une photo
router.patch('/:id', async (req,res) => {
    const photoId = new ObjectId(req.params.id)
    const { src, albumId } = req.body

    if(!src || !albumId){
        return res.status(404).json({
            message: "Img Url ou AlbumId manquant"
        })
    }

    const updatedPhoto = {
        src: src,
        albumId: albumId,
        votes: 0
    }
    
    // récupération de l'ancienne photo
    const photo = await Photo.findOne({ _id: photoId });
    const albumCover = await Album.findOne({
        _id: new ObjectId(albumId),
        cover: photo.src
    })

    try {
        const result = await Photo.updateOne(
            { _id: photoId },
            { $set: updatedPhoto }
        )

        if(result.matchedCount === 0){
            return res.status(404).json({
                message: "Photo non trouvée"
            })
        }

        if(albumCover){
            await Album.updateOne(
                {_id: new ObjectId(albumId) },
                { $set: { cover: updatedPhoto.src } }
            )
        }

        const newPhoto = await Photo.findOne({
            _id:  photoId
        })

        res.json({
            message: "L'image a bien été mise à jour",
            photo: newPhoto 
        })
    
    } catch (error){
        console.error('Erreur lors du changement de la photo:', error)
        res.status(500).json({
            message: 'Erreur lors du changement de la photo',
            error: error.message
        })
    }
})

// Ajouter un Vote à une photo
router.patch('/:id/like', async (req,res) => {
    
    try {
        const photoId = new ObjectId(req.params.id)
        
        const result = await Photo.updateOne(
            { _id: photoId},
            { $inc: { votes: 1 } }
        )

        if(result.matchedCount === 0) {
            return res.status(404).json({ message: "Photo non trouvée" })
        }
        
        const updatedPhoto = await Photo.findOne({
            _id: photoId
        })

        res.json(updatedPhoto)
    } catch (error) {
        res.status(500).json( {message: "Erreur lors du vote", error: error.message })
    }
})

export default router