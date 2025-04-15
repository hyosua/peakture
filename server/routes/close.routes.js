import express from "express";
import { getWinner, handleTie, closeVotes, tieBreak} from '../controllers/close.controller.js'
import { identifyUserOrGuest } from "../middleware/identifyUserOrGuest.js";


// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();


router.patch("/:id/winner", getWinner);
router.patch("/:id/tie", handleTie);
router.patch("/:id/close-votes", closeVotes)
router.patch('/:id/tie-break', identifyUserOrGuest, tieBreak)


export default router;