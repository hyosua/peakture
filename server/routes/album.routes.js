import express from "express";
import { getAlbum, createAlbum, editAlbum, deleteAlbum, deleteAlbumFromCloudinary} from '../controllers/album.controller.js'


// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();


router.get('/:id', getAlbum);
router.post("/", createAlbum);
router.patch("/:id", editAlbum);
router.delete("/:id", deleteAlbum);
router.delete('/:id/cloudinary/delete', deleteAlbumFromCloudinary)

export default router;