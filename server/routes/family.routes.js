import express from 'express'
import { create } from '../controllers/family.controller.js'
import { protectRoute } from '../middleware/protectRoute.js'

const router = express.Router()

router.post('/create', protectRoute, create) 
// router.get('/join', join)
  
export default router