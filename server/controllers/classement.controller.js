import bcrypt from 'bcryptjs'
import Family from '../models/family.model.js'
import User from '../models/user.model.js'
import Photo from '../models/photo.model.js'
import Album from '../models/album.model.js'
import me from '../routes/auth.routes.js'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'
import { sendFamilyNotification } from '../lib/utils/sendEmail.js'

export const getClassementAnnuel = async (req, res) => {
    try {
        const familyId = req.params.familyId
        const classement = await User.find({ familyId })
                                    .select('username score')
                                    .sort({ score: -1 });
        if(!classement){
            return res.status(404).json({ message: "Aucun utilisateur dans le classement" })
        }

        res.status(200).json(classement)
    }catch (error){
        console.log("Error in getClassementAnnuel controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const getClassementLastAlbum = async (req, res) => {
    try {
        const familyId = req.params.familyId
        const lastAlbum = await Album.findOne({familyId, status: "closed "}).sort({ createdAt: -1 })
        if(!lastAlbum){
            return res.status(404).json({ message: "Aucun album clos"})
        }
        const classement = await Photo.find({albumId: lastAlbum._id})
                                    .select('username votes')
                                    .sort({ votes: -1 });
        if(!classement){
            return res.status(404).json({ message: "Aucun utilisateur dans le classement" })
        }

        res.status(200).json(classement)
    }catch (error){
        console.log("Error in getClassementLastAlbum controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

