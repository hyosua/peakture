import express from 'express'
import { create, join } from '../controllers/family.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'

const router = express.Router()

router.post('/create', identifyUserOrGuest, create) 
router.post('/join',identifyUserOrGuest,  join)
  
export default router