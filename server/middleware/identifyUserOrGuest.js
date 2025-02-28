import User from '../models/user.model.js';
import Guest from '../models/guest.model.js'; 
import jwt from 'jsonwebtoken';

export const identifyUserOrGuest = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const sessionId = req.cookies.sessionId;  // Guest session ID stored in cookies

        if (token) {
            // 🔹 Case 1: Registered User (Token-Based Auth)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return res.status(401).json({ error: "Unauthorized: Token Invalide" });
            }

            const user = await User.findById(decoded.userId).select("-password");
            if (!user) {
                return res.status(404).json({ error: "Utilisateur introuvable" });
            }

            req.user = user;  // Attach user to request
            return next();
        }

        if (sessionId) {
            // 🔹 Case 2: Guest User (Session-Based)
            let guest = await Guest.findOne({ sessionId });
            if (!guest) {
                // Create new guest entry if not found
                guest = new Guest({ sessionId, families: [] });
                await guest.save();
            }

            req.guest = guest;  // Attach guest to request
            return next();
        }

        // 🔹 Case 3: Neither User nor Guest (Unauthorized)
        return res.status(401).json({ error: "Accès non autorisé, veuillez vous connecter ou entrer en mode invité." });

    } catch (error) {
        console.log("Error in identifyUserOrGuest Middleware", error.message);
        return res.status(500).json({ error: "Erreur serveur interne" });
    }
};
