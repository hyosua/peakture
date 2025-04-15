import express from "express"
import { getPhotosFromAlbum, addPhoto, deletePhoto, deleteFromCloudinary, replacePhoto, votePhoto, hasSubmitted } from '../controllers/photos.controller.js'

import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'


const router  = express.Router()


router.get('/:albumId', getPhotosFromAlbum)
router.post('/', addPhoto)
router.delete('/:id', deletePhoto);
router.post('/cloudinary/delete', deleteFromCloudinary)
router.patch('/:id', replacePhoto)
router.patch('/:id/vote', identifyUserOrGuest, votePhoto)
router.get("/:id/has-submitted", identifyUserOrGuest, hasSubmitted)

export default router