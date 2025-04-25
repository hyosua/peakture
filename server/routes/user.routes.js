import express from 'express'
import { getProfile, getUserData, updateProfile } from '../controllers/user.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'

const router = express.Router()

router.get("/:userid", getUserData)
router.get("/profile/:username", getProfile)
router.patch("/update",identifyUserOrGuest, updateProfile)

export default router
