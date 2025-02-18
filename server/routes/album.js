import express from "express";
import db from "../db/connexion.js";
import { ObjectId } from "mongodb";

// router is an instance of express router, we use it to define our routes
// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();

// get all albums
router.get("/", async (req, res) => {
    try {
        let collection = await db.collection("albums");
        let results = await collection.find({}).toArray();
        res.status(200).send(results);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching albums");
    }
});

// Get a specific album by id
router.get("/:id", async (req, res) => {
    try {
        let collection = await db.collection("albums");
        let query = { _id: new ObjectId(req.params.id) };
        let result = await collection.findOne(query);
    
        if (!result) {
            return res.status(404).send("No album found with that id");
        }
        res.status(200).send(result);
    }catch (err) {
        console.error(err);
        res.status(500).send("Error fetching album");
    }
});

// Add a new album
router.post("/", async (req, res) => {
    try {
        let newDocument = {
            month: req.body.month,
            theme: req.body.theme
        };
        let collection = await db.collection("albums");
        let result = await collection.insertOne(newDocument);
        res.status(201).send(result);
    } catch(err) {
        console.error(err);
        res.status(500).send("Error adding a new album");
    }
});

// Update an album by id
router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                theme: req.body.theme
            },
        };
        let collection = await db.collection("albums");
        let result = await collection.updateOne(query, updates);

        // Send back the updated document
        if(result.matchedCount ===0) {
            return res.status(404).send("No album found with that id");
        }

        // Get the updated document
        const updatedAlbum = await collection.findOne(query);
        res.status(200).send(updatedAlbum);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating album");
    }
});

// Delete an album by id
router.delete("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };

        const collection = db.collection("albums");
        let result = await collection.deleteOne(query);

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