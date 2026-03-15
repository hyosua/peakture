import express from 'express'
import { login, signup, logout, getMe, requestPasswordReset, resetPassword, verifyResetToken } from '../controllers/auth.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { validate, signupSchema, loginSchema, requestPasswordResetSchema, resetPasswordSchema } from '../middleware/validate.js'

const router = express.Router()

router.get('/me', identifyUserOrGuest, getMe)
router.post('/signup', authLimiter, validate(signupSchema), signup)
router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/logout', logout)
router.post('/request-password-reset', authLimiter, validate(requestPasswordResetSchema), requestPasswordReset)
router.get('/verify-reset-token', verifyResetToken)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

    
export default router