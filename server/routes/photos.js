import express from "express"
import db from "../db/connexion.js"
import { ObjectId } from "mongodb"

const router  = express.Router()
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Récupérer les photos d'un album
router.get('/:albumId', async (req, res) => {
    try {

        let albumId;
        try {
            albumId = new ObjectId(req.params.albumId);
        } catch (error) {
            return res.status(400).json({ message: "Invalid album ID format" });
        }

        const photos = await db.collection('photos').find({
            albumId: albumId.toString()
        }).toArray()

        res.json({photos});

    } catch (err){
        console.log("Error fetching photos:", err)
        res.status(500).json({ message: "Error fetching photos ",error: err.message })
    }
})

// Ajouter une photo dans l'album
router.post('/', async (req, res) => {
    try {
        const { albumId, src } = req.body

        if( !albumId || !src ) {
            return res.status(400).json({message: "Album Id and Image URL are required" })
        }

        // Ajout de la photo
        const result = await db.collection('photos').insertOne({
            albumId,
            src,
            votes: 0,
            createdAt: new Date()
        })

        // Récupération de la photo 
        const insertedPhoto = await db.collection('photos').findOne({
            _id: result.insertedId
        })

        // MAJ de l'album cover si absent
        const album = await db.collection('albums').findOne({
            _id: ObjectId.createFromHexString(albumId) 
        })

        if(!album.cover){
            await db.collection('albums').updateOne(
                {_id: ObjectId.createFromHexString(albumId) },
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
        const photo = await db.collection('photos').findOne({ _id: photoId });
        
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
        const deleteResult = await db.collection('photos').deleteOne({ _id: photoId });
        
        if (deleteResult.deletedCount === 0) {
            return res.status(500).json({ message: "Failed to delete photo" });
        }

        // Vérif si la photo était une cover
        const albumCover = await db.collection('albums').findOne({
            _id: albumObjectId,
            cover: photo.src
        });

        // Si nécessaire MAJ de la cover de l'album
        if (albumCover) {
            const otherPhoto = await db.collection('photos').findOne({
                albumId: photo.albumId,
                _id: { $ne: photoId }
            });

            const updateOperation = otherPhoto 
                ? { $set: { cover: otherPhoto.src } }
                : { $unset: { cover: "" } };

            const albumUpdateResult = await db.collection('albums').updateOne(
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
            return res.status(505).json({
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

    try {
        const result = await db.collection('photos').replaceOne(
            { _id: photoId },
            updatedPhoto
        )

        if(result.count === 0){
            return res.status(404).json({
                message: "Photo non trouvée"
            })
        }

        const albumCover = await db.collection('albums').findOne({
            _id: albumId,
            cover: src
        })

        if(albumCover){
            await db.collection('albums').updateOne(
                {_id: albumId },
                { cover: updatedPhoto.src }
            )
        }

        const newPhoto = await db.collection('photos').findOne({
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
    const photoId = ObjectId.createFromHexString(req.params.id)
    try {
        const result = await db.collection('photos').updateOne(
            { _id: photoId},
            { $inc: { votes: 1 } }
        )
        const updatedPhoto = await db.collection('photos').findOne({
            _id: photoId
        })

        res.json(updatedPhoto)
    } catch (error) {
        res.status(500).json( {message: "Erreur lors du vote", error: error.message })
    }
})

export default router