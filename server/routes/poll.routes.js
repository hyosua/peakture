import express from 'express'
import { create, getPoll } from '../controllers/poll.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'

const router = express.Router()

router.post('/create', create) 
router.get('/:id', identifyUserOrGuest, getPoll) 

  
export default router