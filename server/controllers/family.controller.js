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

        const existingFamily = await Family.findOne({name: familyName})
        console.log(existingFamily)
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

export const join = async (req, res) => {
    try{
        const { inviteCode } = req.body
        const family = await Family.findOne({ inviteCode })
        if(!family){
            return res.status(400).json({ message:"Cette famille n'est pas enregistrée chez nous..."})
        }

        if(req.user){ // si un utilisateur enregistré rejoint une famille
            if(!req.user.families.includes(family._id)){
                req.user.families.push(family._id)
                await req.user.save()
            }

            if(!family.members.includes(req.user._id)){
                family.members.push(req.user._id)
                await family.save()
            }

            return res.status(201).json({ message: "Bienvenue dans la famille !", family})
        }

        if(req.guest) { // Si un guest rejoins une famille
            if (!req.guest.families.includes(family._id)) {
                req.guest.families.push(family._id);
                await req.guest.save();
            }
            if (!family.guestMembers.includes(req.guest._id)) {
            family.guestMembers.push(req.guest._id);
            await family.save();
            }
              return res.json({ message: "Un nouvel invité dans la famille !", family });
        }
    }catch(error){
        console.log("Error in join family controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}
