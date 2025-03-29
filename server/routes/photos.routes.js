import express from "express"
import { getPhotosFromAlbum, addPhoto, deletePhoto, deleteFromCloudinary, replacePhoto, votePhoto } from '../controllers/photos.controller.js'

import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'


const router  = express.Router()


router.get('/:albumId', getPhotosFromAlbum)
router.post('/', addPhoto)
router.delete('/:id', deletePhoto);
router.post('/cloudinary/delete', deleteFromCloudinary)
router.patch('/:id', replacePhoto)
router.patch('/:id/vote', identifyUserOrGuest, votePhoto)

export default router