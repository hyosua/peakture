import express from 'express'
import { getClassementAnnuel, getClassementAlbum } from '../controllers/classement.controller.js'

const router = express.Router()

router.get("/:familyId/annuel", getClassementAnnuel)
router.get("/:familyId/album", getClassementAlbum)


export default router
