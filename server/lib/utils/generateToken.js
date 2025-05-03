import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid' // génère un sessionid unique

export const generateTokenAndSetCookie = (res, userId=null) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = isProduction ? '.peakture.fr' : undefined; 
    const cookieOptions = {
        domain: cookieDomain,
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 jours en millisecondes
        httpOnly: true, // empêche les attaques XSS (cross-site scripting)
        sameSite: "None", // empêche les attaques CSRF (cross-site request forgery)
        secure: true, // le cookie ne sera envoyé que sur HTTPS
        Path: "/", // le cookie sera accessible sur tout le site
    }

    if(userId){
        const token = jwt.sign({ userId }, process.env.JWT_SECRET,{
            expiresIn: '15d'
        })
        res.cookie("jwt", token,cookieOptions)
    } else {
        const sessionId = uuidv4()
        
        res.cookie("sessionId", sessionId,{
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000 // 1 jour pour la session
        })

        return sessionId
    }
}