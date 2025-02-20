import express from "express";
import db from "../db/connexion.js";
import { ObjectId } from "mongodb";

// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();

// Récupérer tous les albums
router.get("/", async (req, res) => {
    try {
        let results = await db.collection("albums").find({}).toArray();
        res.status(200).send(results);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching albums");
    }
});

// Récupérer un album par son mois
router.get('/:month', async (req, res) => {
    try {
        console.log("Requète:",req)
        const album = await db.collection('albums').findOne({
            month: req.params.month
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

// // Récupérer un album par son mois
// router.get('/album/:month', async (req, res) => {
//     try {
//         const album = await db.collection('albums').findOne({ 
//             month: req.params.month 
//         });
        
//         if (!album) {
//             return res.status(404).json({ message: 'Album not found' });
//         }
        
//         // Récupérer les photos associées à cet album
//         const photos = await db.collection('photos').find({ 
//             albumId: album._id.toString() 
//         }).toArray();
        
//         // Ajouter les photos à l'objet album
//         album.photos = photos;
        
//         res.json(album);
//     } catch (error) {
//         console.error('Error fetching album by month:', error);
//         res.status(500).json({ message: 'Error fetching album', error: error.message });
//     }
// });

// Créer un album
router.post("/", async (req, res) => {
    try {
        let newDocument = {
            month: req.body.month,
            theme: req.body.theme
        };
        const result = await db.collection("albums").insertOne(newDocument);
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
        
        const result = await db.collection("albums").updateOne(query, updates);

        // Send back the updated document
        if(result.matchedCount === 0) {
            console.log(`No album found with id: ${req.params.id}`);
            return res.status(404).send("Aucun album n'existe avec cet id.");
        }

        // Get the updated document
        const updatedAlbum = await db.collection("albums").findOne(query);

        res.status(200).send(updatedAlbum);
    } catch (error) {
        console.error('Error updating album:', error);
        res.status(500).json({ message: 'Error updating album', error: error.message });
    }
});

// Supprimer un album par id
router.delete("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };

        const result = await db.collection("albums").deleteOne(query);

        if (result.deletedCount === 0){
            return res.status(404).send("No album found with that id");
        }

        await db.collection('photos').deleteMany({
            albumId: ObjectId.createFromHexString(req.params.id) 
        })
        
        res.status(200).send(result)
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting album");
    }
});

export default router;