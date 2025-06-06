import express from "express";
import { getAlbum, createAlbum, editAlbumTheme, deleteAlbum, deleteAlbumFromCloudinary, editAlbumDescription, setCountdown} from '../controllers/album.controller.js'


// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();


router.get('/:id', getAlbum);
router.post("/", createAlbum);
router.patch("/:id", editAlbumTheme);
router.put("/:id/countdown", setCountdown);
router.patch("/:id/edit-description", editAlbumDescription);
router.delete("/:id", deleteAlbum);
router.delete('/:id/cloudinary/delete', deleteAlbumFromCloudinary)

export default router;