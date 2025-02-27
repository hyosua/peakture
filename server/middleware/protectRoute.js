import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt
        if(!token){
            return res.status(401).json({error: "Tu dois d'abord te connecter"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({error: "Unauthorized: Token Invalide"})
        }

        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            return res.status(404).json({error: "Utilisateur introuvable"})
        }

        req.user = user
        next()
    }catch(error){
        console.log("Error in protectRoute Middleware", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}