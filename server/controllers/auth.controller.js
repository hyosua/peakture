import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import User from '../models/user.model.js'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'
import Family from '../models/family.model.js'
import { sendPasswordResetNotification, sendSignupNotification } from '../lib/utils/sendEmail.js'

export const signup = async (req, res) => {
    try {
        let { username, email, password, inviteCode } = req.body
        username = username.trim()
        email = email.trim().toLowerCase()
        
        const existingUser = await User.findOne({ username })
        if(existingUser){
            return res.status(400).json({ error: "Ce pseudo est déjà pris"})
        }

        const existingEmail = await User.findOne({ email })
        if(existingEmail){
            return res.status(400).json({ error: "Cet email est déjà utilisé"})
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        console.log("Invite code", inviteCode)
        if(inviteCode){
            const result = await Family.findOneAndUpdate(
                { inviteCode },
                { $push: { members: newUser._id }},
                { new: true }
            )
            console.log("Family update Result:", result)
            if(!result){
                return res.status(400).json({error: "Code d'invitation invalide"})
            }
            
            newUser.familyId = result._id
            
        }

        if(newUser){
            generateTokenAndSetCookie(res, newUser._id)
            await newUser.save()
            await sendSignupNotification(email, username)

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                email: newUser.email,
                familyId: newUser.familyId,
                avatar: newUser.avatar,
                
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
        let { identifier, password } = req.body
        identifier = identifier.trim();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const query = isEmail ? { email: identifier } : { username: identifier };
        const user = await User.findOne(query)
        const correctPass = await bcrypt.compare(password, user?.password || "")

        if(!user){
            return res.status(400).json({error: "Utilisateur introuvable..."})
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
            avatar: user.avatar,
            isGuest: user.isGuest
            
        })

    }catch (error){
        console.log("Error in login controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const logout = async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = isProduction ? '.peakture.fr' : undefined; 
    try {
        console.log("[logout] Attempting to clear jwt cookie");
        console.log("Environnement:", process.env.NODE_ENV);
        console.log(" - Domain:", cookieDomain);


        console.log("Cookies received in request:", req.cookies);

        res.cookie("jwt", "", {
            domain: cookieDomain, 
            httpOnly: true,
            sameSite: "None", 
            secure: true,   
            maxAge: 0,
            path: "/" 
        });

        res.cookie("jwt", "", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 0
        });
        res.status(200).json({message: "Tu es bien déconnecté. À bientôt pour de nouvelles aventures !"})
    } catch (error) {
        console.log("Error in logout controller", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMe = async (req, res) => {
    try {

        let user = req.user || req.guest
        
        if(!user){
            return res.status(400).json({error: "Aucun utilisateur"})
        }

        if(req.user){

             // Convertir le document Mongoose en objet JS standard
             const userObj = user.toObject ? user.toObject() : user;
            
             // Récupérer les détails de la famille
             const familyData = userObj.familyId 
                ? await Family.findById(userObj.familyId) 
                : null;
 
             // Renvoyer l'utilisateur avec les données de famille
             return res.status(200).json({
                 ...userObj,
                 family: userObj.familyId || null,
                 familyData
            })

        }

        res.status(200).json(user)
    }catch (error){
        console.log("Error in getMe controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body
        
        const user = await User.findOne({ email })

        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = Date.now() + 1000 * 60 * 60; // Expire dans 1H

        user.resetToken = token;
        user.resetTokenExpires = expiresAt;
        await user.save();
        const base_url = process.env.NODE_ENV === "production" ? "https://www.peakture.fr" : "http://localhost:5173"
        const resetUrl = `${base_url}/reset-password?token=${token}`;

        await sendPasswordResetNotification(user.username, email, resetUrl)
        res.status(200).json({ success: true, message: "Un email de réinitialisation a été envoyé à l'adresse indiquée" })
    }catch (error){
        console.log("Error in auth controller (requestPasswordReset", error.message)
        return res.status(500).json({ success: true, error: "Internal Server Error"})
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, password } = req.body
        const user = await User.findOne({ resetToken })

        if(!user){
            return res.status(404).json({ success: false, message: "Aucun utilisateur avec cet email"})
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        user.password = hashedPassword
        user.resetToken = undefined
        user.resetTokenExpires = undefined
        await user.save()

        res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès!" })
    }catch (error){
        console.log("Error in auth controller", error.message)
        return res.status(500).json({ success: true, error: "Internal Server Error"})
    }
}

export const verifyResetToken = async(req, res) => {
    try{
        const { token } = req.query;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() }
        });
        console.log("User Reset Token", user)
        if (!user) return  res.status(400).json({ isValid: false })

        res.json({ isValid: true, email: user.email })
    }catch(error){
        console.log("Error in auth controller (verifyResetToken)", error.message)
        return res.status(500).json({ success: true, error: "Internal Server Error"})
    }
}