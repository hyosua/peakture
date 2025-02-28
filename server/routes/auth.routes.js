import express from 'express'
import { login, signup, logout, getMe } from '../controllers/auth.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'

const router = express.Router()

router.get('/me', identifyUserOrGuest, getMe)
router.post('/signup', signup) 
router.post('/login', login)
router.post('/logout', logout)

    
export default router