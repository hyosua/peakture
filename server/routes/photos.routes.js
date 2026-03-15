import express from "express"
import { getPhotosFromAlbum, addPhoto, deletePhoto, deleteFromCloudinary, replacePhoto, votePhoto, hasSubmitted } from '../controllers/photos.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'
import { validate, addPhotoSchema } from '../middleware/validate.js'

const router  = express.Router()

router.get('/:albumId', getPhotosFromAlbum)
router.post('/', identifyUserOrGuest, validate(addPhotoSchema), addPhoto)
router.delete('/:id', identifyUserOrGuest, deletePhoto);
router.post('/cloudinary/delete', identifyUserOrGuest, deleteFromCloudinary)
router.patch('/:id', identifyUserOrGuest, replacePhoto)
router.patch('/:id/vote', identifyUserOrGuest, votePhoto)
router.get("/:id/has-submitted", identifyUserOrGuest, hasSubmitted)

export default router