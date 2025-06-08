import express from "express";
import { tieBreak, closeAlbum} from '../controllers/close.controller.js'
import { identifyUserOrGuest } from "../middleware/identifyUserOrGuest.js";


// The router will be added as a middleware and will take control of requests starting with the path we give it
const router = express.Router();


router.patch("/:id/close-album", closeAlbum)
router.patch('/:id/tie-break', identifyUserOrGuest, tieBreak)


export default router;