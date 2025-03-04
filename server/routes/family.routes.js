import express from 'express'
import { create, join, getAlbums, getFamily } from '../controllers/family.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'

const router = express.Router()

router.post('/create', identifyUserOrGuest, create) 
router.post('/join',identifyUserOrGuest,  join)
router.get('/albums/:id', getAlbums)
router.get('/:id', getFamily)
  
export default router