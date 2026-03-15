import express from 'express'
import { create, join, change, getAlbums, getFamily, familyLogout, getPeakture, validateInviteCode, editFamilyName } from '../controllers/family.controller.js'
import { identifyUserOrGuest } from '../middleware/identifyUserOrGuest.js'
import { validate, editFamilyNameSchema, validateInviteCodeSchema } from '../middleware/validate.js'

const router = express.Router()

router.post('/create', identifyUserOrGuest, create)
router.post('/join', identifyUserOrGuest, join)
router.patch('/change', identifyUserOrGuest, change)
router.patch('/:id/edit-name', identifyUserOrGuest, validate(editFamilyNameSchema), editFamilyName)
router.post('/:id/logout', identifyUserOrGuest, familyLogout)
router.get('/albums/:id', getAlbums)
router.get('/:id', getFamily)
router.get('/:id/peakture', getPeakture)
router.post('/validate-invite-code', validate(validateInviteCodeSchema), validateInviteCode)
  
export default router