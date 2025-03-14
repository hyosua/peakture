import bcrypt from 'bcryptjs'
import Family from '../models/family.model.js'
import User from '../models/user.model.js'
import Guest from '../models/guest.model.js'
import Album from '../models/album.model.js'
import me from '../routes/auth.routes.js'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'

export const getFamily = async (req, res) => {
    try {
        const id = req.params.id
        const family = await Family.findById(new ObjectId(id));
        console.log("family trouvée dans API:", family);
        res.status(200).json({ family })
    }catch (error){
        console.log("Error in getFamily controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const create = async (req, res) => {
    try {
        const familyName = req.body.name

        if(!familyName){
            return res.status(400).json({message: "Tu dois rentrer un nom de Famille valide."})
        }

        const existingFamily = await Family.findOne({name: familyName})
        if(existingFamily){
            return res.status(401).json({message: "Cette famille existe déjà"})
        }

        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase()
        const user = req.user ? req.user : req.guest
        const newFamily = new Family({
            name: familyName,
            admin: user._id,
            inviteCode
        })



        if(newFamily){
            if(req.user){
                await User.updateOne({_id: user._id}, {role: "admin"})
            }
            if(req.guest){
                await Guest.updateOne({_id: user._id}, {role: "admin"})

            }
            await newFamily.save()
            const family = newFamily
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
            return res.status(400).json({ message: "Aucune famille ne correspond à ce code...", family: null })
        }

        if (req.user) {
            // Un utilisateur enregistré rejoint une famille
            if (!req.user.families.includes(family._id)) {
                req.user.families.push(family._id)
                await req.user.save()
            }

            if (!family.members.includes(req.user._id)) {
                family.members.push(req.user._id)
                await family.save()
            }

            return res.status(201).json({ message: "Bienvenue dans la famille !", family })
        }

        // Gestion des invités avec un sessionId
        let sessionId = req.cookies.sessionId
        let guest

        if (!sessionId) {
            sessionId = generateTokenAndSetCookie(res) // Générer un sessionId
            guest = new Guest({ sessionId, families: [family._id] })
            await guest.save()
        } else {
            // Vérifier si le guest existe déjà
            guest = await Guest.findOne({ sessionId })
            if (!guest) {
                guest = new Guest({ sessionId, families: [family._id] })
                await guest.save()
            }
        }

        // Ajouter le guest à la famille
        if (!guest.families.includes(family._id)) {
            guest.families.push(family._id)
            await guest.save()
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

export const getAlbums = async (req, res) => {
    try{
        const familyId = req.params.id
        console.log("familyId reçu dans API:", familyId);

        const albums = await Album.find({ familyId: new ObjectId(familyId) })
        console.log("résultat requète getAlbums:", albums);

        if (!albums) {
            return res.status(404).json({ message: 'Aucun album trouvé' });
        }

        res.json(albums)
    } catch (error){
        console.error("Erreur dans getAlbums Family Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}