import User from '../models/user.model.js'
import Guest from '../models/guest.model.js' 
import jwt from 'jsonwebtoken'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'

export const identifyUserOrGuest = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        let sessionId = req.cookies.sessionId 

        if (token) {
            // utilisateur enregistré
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (!decoded) {
                return res.status(401).json({ error: "Unauthorized: Token Invalide" })
            }

            const user = await User.findById(decoded.userId).select("-password")
            if (!user) {
                return res.status(404).json({ error: "Utilisateur introuvable" })
            }

            req.user = user 
            return next()
        }

        if (sessionId) {
            // Guest User
            let guest = await Guest.findOne({ sessionId })
            if (!guest) {
                guest = new Guest({ 
                    sessionId, 
                    families: []
                 })
                await guest.save()
            }

            req.guest = guest  
            return next()
        }

        // si nouvel invité
        sessionId = generateTokenAndSetCookie(res)

        const guest = new Guest({ sessionId, families: [] });
        await guest.save();

        req.guest = guest;
        next();

    } catch (error) {
        console.error("Error in identifyUserOrGuest Middleware", error?.message || error)
        return res.status(500).json({ error: "Erreur serveur interne" })
    }
}
