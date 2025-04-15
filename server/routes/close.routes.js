import express from "express";
import { getWinner, handleTie, closeVotes} from '../controllers/close.controller.js'


// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();


router.patch("/:id/winner", getWinner);
router.patch("/:id/tie", handleTie);
router.patch("/:id/close-votes", closeVotes)

export default router;