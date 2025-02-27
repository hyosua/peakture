import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'

export const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g

        if(!emailRegex.test(email)){
            return res.status(400).json({ error: "Format email invalide"})
        }

        if(password.length < 6){
            return res.status(400).json({ error: "Ton mot de passe doit avoir plus de 6 caractères. (C'est pour ton bien)"})
        }

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
            role,
            password: hashedPassword
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                email: newUser.email,
                familyId: newUser.familyId,
                profileImg: newUser.familyId,
                isGuest: newUser.isGuest
                
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
    
}

export const logout = async (req, res) => {
    
}