import express from 'express'
import { getClassementAnnuel } from '../controllers/classement.controller.js'
import { getClassementLastAlbum } from '../controllers/classement.controller.js'

const router = express.Router()

router.get("/:familyId/annuel", getClassementAnnuel)
router.get("/:familyId/lastAlbum", getClassementLastAlbum)


export default router
