import express from "express";
import { closeAlbum, setCountdown, tieBreakVote} from '../controllers/close.controller.js'
import { identifyUserOrGuest } from "../middleware/identifyUserOrGuest.js";

const router = express.Router();

router.patch("/:id/close-album", identifyUserOrGuest, closeAlbum)
router.put("/:id/set-countdown", identifyUserOrGuest, setCountdown)
router.patch('/:id/tie-break', identifyUserOrGuest, tieBreakVote)


export default router;