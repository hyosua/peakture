import express from 'express'
import { create, getPoll, vote, deletePoll } from '../controllers/poll.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'

const router = express.Router()

router.post('/create', create) 
router.post('/:id/vote', identifyUserOrGuest, vote) 
router.get('/:id', identifyUserOrGuest, getPoll) 
router.delete('/delete/:id', deletePoll) 


  
export default router