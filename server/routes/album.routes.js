import express from "express";
import Album from "../models/album.model.js"
import Photo from "../models/photo.model.js"
import User from "../models/user.model.js"
import { getAlbum, createAlbum, editAlbum, getWinner, deleteAlbum, deleteAlbumFromCloudinary , closeAlbum} from '../controllers/album.controller.js'

import { ObjectId } from "mongodb";
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'

// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();


router.get('/:id', getAlbum);
router.post("/", createAlbum);
router.patch("/:id", editAlbum);
router.patch("/:id/winner", getWinner);
router.delete("/:id", deleteAlbum);
router.patch("/:id/close", closeAlbum)

router.delete('/:id/cloudinary/delete', deleteAlbumFromCloudinary)

export default router;