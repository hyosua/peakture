import express from "express"
import db from "../db/connexion.js"
import { ObjectId } from "mongodb"

const router  = express.Router()

// Récupérer les photos d'un album
router.get('/photos/:albumId', async (req, res) => {
    try {
        const photos = await db.collection('photos').find({
            albumId: req.params.albumId
        }).toArray()

        res.json(photos)
    } catch (err){
        console.log("Error fetching photos:", err)
        res.status(500).json({ message: "Error fetching photos ",error: err.message })
    }
})

// Ajouter une photo dans l'album
router.post('/photo', async (req, res) => {
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

// Delete a Photo
router.delete('/photo/:id', async (req, res) => {
    try {
        const photoId = ObjectId.createFromHexString(req.params.id)
        const albumObjectId = ObjectId.createFromHexString(photo.albumId)
        const photo = await db.collection('albums').findOne(
            {_id: photoId },
        )

        if(!photo){
            res.status(404).json({ message: "Photo not found"})
        }

        const result = await db.collection('photos').deleteOne({
            _id: photoId
        })

        const album = await db.collection('albums').findOne({
            _id: albumObjectId,
            cover: photo.src
        })

        if(album){
            const otherPhoto = await db.collection('albums').findOne({
                albumId: photo.albumId, 
                _id: {$ne: photoId}
            })

            if(otherPhoto){
                await db.collection('albums').updateOne(
                    {_id: albumObjectId},
                    { $set: {cover: otherPhoto.src} }
                )
            }else {
                await db.collection('albums').updateOne(
                    { _id: albumObjectId },
                    { $unset: { cover: "" } }
                )
            }
        }
        res.json({ message: 'Photo supprimée'})
    } catch (error) {
        console.error('Error deleting photo:', error)
        res.status(500).json({ message: 'Error deleting photo', error: error.message })
    }
})
