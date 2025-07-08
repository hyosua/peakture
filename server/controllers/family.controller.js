import bcrypt from 'bcryptjs'
import Family from '../models/family.model.js'
import User from '../models/user.model.js'
import Guest from '../models/guest.model.js'
import Album from '../models/album.model.js'
import me from '../routes/auth.routes.js'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'
import { sendFamilyNotification } from '../lib/utils/sendEmail.js'
import { closeAlbumService } from '../services/closeAlbum.service.js'

import Photo from '../models/photo.model.js'

export const getFamily = async (req, res) => {
    try {
        const id = req.params.id
        const family = await Family.findById(new ObjectId(id));
        if(!family){
            return res.status(404).json({ message: "Famille non trouvée" })
        }
        res.status(200).json({ family })
    }catch (error){
        console.log("Error in getFamily controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const familyLogout = async (req, res) => {
    try {
        const id = req.params.id
        const family = await Family.findById(new ObjectId(id));
        const userOrGuest = req.user || req.guest

        if(userOrGuest){
            await userOrGuest.updateOne({ $unset: { familyId: 1 } })
            await userOrGuest.save()  

            if (family.members.includes(userOrGuest._id)) {
                family.members.pull(userOrGuest._id)
                await family.save()
            }

            return res.status(204).send()
        }
        
    }catch (error){
        console.log("Error in familyLogout controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const create = async (req, res) => {
    try {
        const familyName = req.body.name
        if(!familyName){
            return res.status(400).json({success: false, message: "Tu dois rentrer un nom de Famille valide."})
        }

        const existingFamily = await Family.findOne({name: familyName})
        if(existingFamily){
            return res.status(401).json({success: false, message: "Cette famille existe déjà"})
        }

        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase()
        const user = req.user || req.guest
        const newFamily = new Family({
            name: familyName,
            admin: user._id,
            members: req.user ? [user._id] : [],
            guestMembers: req.guest ? [user._id] : [],
            inviteCode
        })

        if(newFamily){
            if(req.user){
                await User.updateOne(
                    {_id: req.user._id}, 
                    {
                        role: "admin",
                        familyId: newFamily._id
                    }
                )
            }
            if(req.guest){
                console.log("user:", user)
                await Guest.updateOne(
                    {_id: req.guest._id}, 
                    {
                        role: "admin",
                        familyId: newFamily._id
                    })

            }
            await newFamily.save()
            const family = newFamily

            if (req.user) { // Envoi de l'email de notification à l'utilisateur enregistré
                sendFamilyNotification(user.email, user.username, family.name, family._id, family.inviteCode)
            }

            res.status(201).json({
                _id: newFamily._id,
                family,
                name: newFamily.name,
                admin: newFamily.admin,
                inviteCode: newFamily.inviteCode,
                
            })
        } else{
            res.status(400).json({error: "Données de la famille non valides"})
        }
    }catch (error){
        console.log("Error in family controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const join = async (req, res) => {
    try {
        const { inviteCode } = req.body

        // Vérification du code d'invitation
        const family = await Family.findOne({ inviteCode })
        if (!family) {
            return res.status(404).json({ message: "Aucune famille ne correspond à ce code...", family: null })
        }

        if (req.user) {
            // Un utilisateur enregistré rejoint une famille
            if (!req.user.familyId) {  
                req.user.familyId = family._id;  
                await req.user.save();  
            } else {  
                return res.status(400).json({ message: "L'utilisateur appartient déjà à une famille." });
            }

            if (!family.members.includes(req.user._id)) {
                family.members.push(req.user._id)
                await family.save()
            }

            return res.status(201).json({ message: "Bienvenue dans la famille !", family, user: req.user })
        }

        // Gestion des invités avec un sessionId
        let sessionId = req.cookies.sessionId
        let guest

        if (!sessionId) {
            sessionId = generateTokenAndSetCookie(res) // Générer un sessionId
            guest = new Guest({ sessionId, familyId: [family._id] })
            await guest.save()
        } else {
            // Vérifier si le guest existe déjà
            guest = await Guest.findOne({ sessionId })
            if (!guest) {
                guest = new Guest({ sessionId, familyId: [family._id] })
                await guest.save()
            }
        }

        // Ajouter le guest à la famille
        if (!req.guest.familyId) {  
            req.guest.familyId = family._id;  
            await req.guest.save();  
        } else {  
            return res.status(400).json({ message: "L'utilisateur appartient déjà à une famille." });
        }

        if (!family.guestMembers.includes(guest._id)) {
            family.guestMembers.push(guest._id)
            await family.save()
        }

        return res.status(201).json({ message: "Invité ajouté à la famille", family, sessionId })
    } catch (error) {
        console.error("Erreur dans join Family Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}

export const change = async (req, res) => {
    try {
        const { inviteCode } = req.body

        // Vérification du code d'invitation
        const family = await Family.findOne({ inviteCode })
        const previousFamily = await Family.findById(req.user.familyId)
        if (!family) {
            return res.status(404).json({ message: "Aucune famille ne correspond à ce code...", family: null })
        }

        if (req.user) {
            // Un utilisateur enregistré change de famille
            req.user.familyId = family._id;  
            await req.user.save();  

            family.members.push(req.user._id)
            await family.save()
            if(previousFamily){
                previousFamily.members.pull(req.user._id)
                await previousFamily.save()
            }

            return res.status(201).json({ message: `Bienvenue dans la famille !`, family, user: req.user })
        }

        // Gestion des invités avec un sessionId
        let sessionId = req.cookies.sessionId
        let guest

        if (!sessionId) {
            sessionId = generateTokenAndSetCookie(res) // Générer un sessionId
            guest = new Guest({ sessionId, familyId: [family._id] })
            await guest.save()
        } else {
            // Vérifier si le guest existe déjà
            guest = await Guest.findOne({ sessionId })
            if (!guest) {
                guest = new Guest({ sessionId, familyId: [family._id] })
                await guest.save()
            }
        }

        // Ajouter le guest à la famille
            req.guest.familyId = family._id;  
            await req.guest.save();  

        if (!family.guestMembers.includes(guest._id)) {
            family.guestMembers.push(guest._id)
            await family.save()
            previousFamily.guestMembers.pull(guest._id)
            await previousFamily.save()
        }

        return res.status(201).json({ message: "Invité ajouté à la famille", family, sessionId })
    } catch (error) {
        console.error("Erreur dans change Family Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}
export const editFamilyName = async (req, res) => {
    try {
        const update = req.body
        const updatedFamily = await Family.findByIdAndUpdate(req.params.id, update, {
            new : true,
            runValidators: true, // Verifie le format défini dans le schéma mongoose
        })
        return res.status(200).json({ success: true, message: "Le nom de la Family a bien été modifié", updatedFamily })
    } catch (error) {
        console.error("Erreur dans change Family Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}

export const getAlbums = async (req, res) => {
    try{
        const familyId = req.params.id
        const albums = await Album.find({ familyId}).sort({ month: -1, year: -1})
        const updatedAlbums = []
        const now = new Date();

        if (albums.length === 0) {
            return res.status(404).json({ message: 'Aucun album trouvé' });
        }

        for (let album of albums) {
            // Vérifie si l'album est en countdown et si la date de countdown est passée
            if (album.status === 'countdown' && album.expiresAt < now) {
                await closeAlbumService(album._id, album.familyId);
                album = await Album.findById(album._id)
            }

            if (album.status === 'closed' && album.winnerId && album.winnerModel) {
                album = await Album.findById(album._id).populate([
                    { path: 'winnerId' },
                    { path: 'peakture' }
                ]);
            }
            updatedAlbums.push(album);
        }

        res.json(updatedAlbums)
    } catch (error){
        console.error("Erreur dans getAlbums Family Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}

export const getPeakture = async (req, res) => {
    try{
        const familyId = req.params.id
        const lastClosedAlbum = await Album.findOne(
            {familyId, status: "closed"}
        ).sort({ createdAt: -1})
        
        if(!lastClosedAlbum){
            return res.status(404).json({ message: 'Aucun album trouvé' })
        }
        const peakture = await Photo.findOne({
            _id: lastClosedAlbum.peakture
        }).populate("userId", "username avatar score")
        return res.json(peakture)
    }catch (error){
        console.error("Erreur dans getPeakture Family Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}

export const validateInviteCode = async (req, res) => {
    try{
        const {inviteCode} = req.body
        const existingFamily = await Family.findOne(
            {inviteCode: inviteCode}
        )
        
        if(!existingFamily){
            return res.status(404).json({ message: 'Aucune famille ne correspond' })
        }

        const familyName = existingFamily.name
        return res.status(200).json({ message: `Code valide, la famille ${familyName} t'attend!`})

    }catch (error){
        console.error("Erreur dans getPeakture Family Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}