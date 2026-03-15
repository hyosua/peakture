import express from 'express'
import { login, signup, logout, getMe, requestPasswordReset, resetPassword, verifyResetToken } from '../controllers/auth.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.get('/me', identifyUserOrGuest, getMe)
router.post('/signup', authLimiter, signup)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.post('/request-password-reset', authLimiter, requestPasswordReset)
router.get('/verify-reset-token', verifyResetToken)
router.post('/reset-password', resetPassword)

    
export default router