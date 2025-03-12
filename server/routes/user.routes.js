import express from 'express'

const router = express.Router()

router.get("/profile/:username", protectRoute, getUserProfile)
// router.post("update", protectRoute, updateUserProfile)