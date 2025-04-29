import User from '../models/user.model.js'
import Guest from '../models/guest.model.js' 
import jwt from 'jsonwebtoken'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'
import generatePseudo from '../lib/utils/generatePseudo.js'

export const identifyUserOrGuest = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        let sessionId = req.cookies.sessionId
        
        // Debug log to see what cookies we're receiving
        console.log("Cookies received:", req.cookies)
        
        if (token) {
            // Registered user logic - unchanged
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
            // Guest User logic
            console.log("Found existing sessionId:", sessionId)
            let guest = await Guest.findOne({ sessionId })
            
            if (!guest) {
                console.log("No guest found with sessionId, creating new guest")
                const username = generatePseudo()
                guest = new Guest({ 
                    sessionId,
                    username, 
                })
                await guest.save()
            } else {
                console.log("Found existing guest:", guest.username)
            }

            req.guest = guest  
            return next()
        }

        // New guest logic
        console.log("No sessionId found, generating new one")
        sessionId = generateTokenAndSetCookie(res)
        const username = generatePseudo()
        const guest = new Guest({ sessionId, username });
        await guest.save();
        console.log("Created new guest with sessionId:", sessionId)

        req.guest = guest;
        return next();

    } catch (error) {
        console.error("Error in identifyUserOrGuest Middleware", error?.message || error)
        return res.status(500).json({ error: "Erreur serveur interne" })
    }
}
