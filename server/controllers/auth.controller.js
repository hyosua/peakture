import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'
import Family from '../models/family.model.js'

export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body
        
        const existingUser = await User.findOne({ username })
        if(existingUser){
            return res.status(400).json({ error: "Ce pseudo est déjà pris"})
        }

        const existingEmail = await User.findOne({ email })
        if(existingEmail){
            return res.status(400).json({message: "Cet email est déjà utilisé"})
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        if(newUser){
            generateTokenAndSetCookie(res, newUser._id)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                email: newUser.email,
                families: newUser.familyId,
                profileImg: newUser.profileImg,
                
            })
        } else{
            res.status(400).json({error: "Données utilisateur invalides"})
        }
    }catch (error){
        console.log("Error in signup controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({username})
        const correctPass = await bcrypt.compare(password, user?.password || "")

        if(!user){
            return res.status(400).json({error: "Utilisateur introuvable... mais on t'aime quand même!"})
        }

        if(!correctPass){
            return res.status(400).json({error: "Qui va là? mot de passe incorrect"})
        }

        res.clearCookie("sessionId"); // Supprime le sessionId d'invité

        generateTokenAndSetCookie(res, user._id)

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            familyId: user.familyId,
            profileImg: user.familyId,
            isGuest: user.isGuest
            
        })

    }catch (error){
        console.log("Error in login controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "",{maxAge:0})
        res.status(200).json({message: "Tu es bien déconnecté. A bientôt pour de nouvelles aventures!"})

    }catch (error){
        console.log("Error in logout controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const getMe = async (req, res) => {
    try {
        let user = req.user ? req.user : req.guest
        
        if(!user){
            return res.status(400).json({error: "Aucun utilisateur"})
        }

        if(req.user){
            const familiesData = await Family.find({
                _id: { $in: user.families }
            })

            user = {
                ...user,
                familiesData
            }
        }
        res.status(200).json(user)
    }catch (error){
        console.log("Error in getMe controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}
