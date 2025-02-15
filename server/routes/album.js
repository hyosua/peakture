import express from "express";

// this will help connect to the database
import db from "../db/connexion.js";

// this help convert the id from string to ObjectId for the id
import { ObjectId } from "mongodb";

// router is an instance of express router, we use it to define our routes
// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();

// this section will help you get a list of all the albums
router.get("/", async (req, res) => {
    let collection = await db.collection("albums");
    let results = await collection.find({}).toArray();
    res.send(results.status(200));
});

// this section will help you get a specific album by id
router.get("/:id", async (req, res) => {
    let collection = await db.collection("albums");
    let query = { _id: ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("No album found with that id").status(404);
    else res.send(result).status(200);
});

// this section will help you add a new album
router.post("/", async (req, res) => {
    try {
        let newDocument = {
            month: req.body.month,
            theme: req.body.theme
        };
        let collection = await db.collection("albums");
        let result = await collection.insertOne(newDocument);
        res.send(result).status(204);
    } catch(err) {
        console.error(err);
        res.statu(500).send("Error adding a new album");
    }
});

// this section will help you update an album by id
router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                month: req.body.month,
                theme: req.body.theme
            },
        };
        let collection = await db.collection("albums");
        let result = await collection.updateOne(query, updates);
        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating album");
    }
});

// this section will help you delete an album by id
router.delete("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };

        const collection = db.collection("albums");
        let result = await collection.deleteOne(query);

        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting album");
    }
});

export default router;