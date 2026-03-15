import express from "express";
import { getAlbum, createAlbum, editAlbumTheme, deleteAlbum, deleteAlbumFromCloudinary, editAlbumDescription} from '../controllers/album.controller.js'
import { validate, createAlbumSchema, editAlbumThemeSchema, editAlbumDescriptionSchema } from '../middleware/validate.js'

const router = express.Router();

router.get('/:id', getAlbum);
router.post("/", validate(createAlbumSchema), createAlbum);
router.patch("/:id", validate(editAlbumThemeSchema), editAlbumTheme);
router.patch("/:id/edit-description", validate(editAlbumDescriptionSchema), editAlbumDescription);
router.delete("/:id", deleteAlbum);
router.delete('/:id/cloudinary/delete', deleteAlbumFromCloudinary)

export default router;