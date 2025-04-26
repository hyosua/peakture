import express from 'express'
import { getClassementAlbum, getClassementAnnuel, getClassementMensuel } from '../controllers/classement.controller.js'

const router = express.Router()

router.get("/:familyId/annuel", getClassementAnnuel)
router.get("/:familyId/album", getClassementMensuel)
router.get("/:id", getClassementAlbum)


export default router
