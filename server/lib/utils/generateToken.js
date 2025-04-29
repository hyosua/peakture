import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid' // génère un sessionid unique

export const generateTokenAndSetCookie = (res, userId=null) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 15);

    if(userId){
        const token = jwt.sign({ userId }, process.env.JWT_SECRET,{
            expiresIn: '15d'
        })

        res.cookie("jwt", token,{
            domain: '.peakture.fr',
            maxAge: 15*24*60*60*1000, //15 days in ms
            httpOnly: true, // prevent XSS attacks cross-site scripting attacks
            sameSite:"None", // CSRF attacks cross-site request forgery attacks
            secure: true, 
    
        })
    } else {
        const sessionId = uuidv4()

        res.cookie("sessionId", sessionId,{
            domain: '.peakture.fr',
            maxAge: 24 * 60 * 60 * 1000, // 1 jour en millisecondes
            httpOnly: false, // prevent XSS attacks cross-site scripting attacks
            sameSite:"None", // CSRF attacks cross-site request forgery attacks
            secure: true, 
    
        })

        return sessionId
    }
    

    
}