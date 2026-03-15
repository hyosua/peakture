import express from "express";
import { getAlbum, createAlbum, editAlbumTheme, deleteAlbum, deleteAlbumFromCloudinary, editAlbumDescription} from '../controllers/album.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'
import { validate, createAlbumSchema, editAlbumThemeSchema, editAlbumDescriptionSchema } from '../middleware/validate.js'

const router = express.Router();

router.get('/:id', getAlbum);
router.post("/", identifyUserOrGuest, validate(createAlbumSchema), createAlbum);
router.patch("/:id", identifyUserOrGuest, validate(editAlbumThemeSchema), editAlbumTheme);
router.patch("/:id/edit-description", identifyUserOrGuest, validate(editAlbumDescriptionSchema), editAlbumDescription);
router.delete("/:id", identifyUserOrGuest, deleteAlbum);
router.delete('/:id/cloudinary/delete', identifyUserOrGuest, deleteAlbumFromCloudinary)

export default router;