import express from 'express'
import { getUserData } from '../controllers/user.controller.js'

const router = express.Router()

router.get("/:userid", getUserData)

export default router
// router.post("update", protectRoute, updateUserProfile)