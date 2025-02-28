import bcrypt from 'bcryptjs'
import Family from '../models/family.model.js'
import User from '../models/user.model.js'
import me from '../routes/auth.routes.js'
import crypto from 'crypto'

export const create = async (req, res) => {
    try {
        const familyName = req.body.name
        console.log(familyName)
        if(!familyName){
            return res.status(400).json({error: "Tu dois rentrer un nom de Famille valide."})
        }

        const getUser = req.user
        if(!getUser){
            return res.status(400).json({error: "Tu n'es pas connu de la police pour pouvoir créer une famille, il faut s'inscrire!"})
        }

        const existingFamily = await Family.findOne({familyName})
        if(existingFamily){
            return res.status(401).json({error: "Cette famille existe déjà"})
        }


        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase()

        const newFamily = new Family({
            name: familyName,
            admin: getUser._id,
            inviteCode
        })



        if(newFamily){
            await User.updateOne({_id: getUser._id}, {role: "admin"})
            await newFamily.save()

            res.status(201).json({
                _id: newFamily._id,
                name: newFamily.name,
                admin: newFamily.admin,
                inviteCode: newFamily.inviteCode,
                members: newFamily.guestMembers,
                guestMembers: newFamily.guestMembers
                
            })
        } else{
            res.status(400).json({error: "Données de la famille non valides"})
        }
    }catch (error){
        console.log("Error in family controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}