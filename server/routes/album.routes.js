import express from "express";
import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import { ObjectId } from "mongodb";

// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();

// Récupérer tous les albums
router.get("/", async (req, res) => {
    try {
        let results = await Album.find({});
        res.status(200).send(results);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching albums");
    }
});

// Récupérer un album par son id
router.get('/:id', async (req, res) => {
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
});


// Créer un album
router.post("/", async (req, res) => {
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
});

// MAJ un album par id
router.patch("/:id", async (req, res) => {
    try {      
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                theme: req.body.theme
            },
        };
        
        console.log(`Querying for document with _id:`, query);
        
        const result = await Album.updateOne(query, updates);

        // Send back the updated document
        if(result.matchedCount === 0) {
            console.log(`No album found with id: ${req.params.id}`);
            return res.status(404).send("Aucun album n'existe avec cet id.");
        }

        // Get the updated document
        const updatedAlbum = await Album.findOne(query);

        res.status(200).send(updatedAlbum);
    } catch (error) {
        console.error('Error updating album:', error);
        res.status(500).json({ message: 'Error updating album', error: error.message });
    }
});

// Supprimer un album par id
router.delete("/:id", async (req, res) => {
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
});

export default router;