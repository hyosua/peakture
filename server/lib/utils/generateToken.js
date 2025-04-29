import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid' // génère un sessionid unique

export const generateTokenAndSetCookie = (res, userId=null) => {

    if(userId){
        const token = jwt.sign({ userId }, process.env.JWT_SECRET,{
            expiresIn: '15d'
        })

        res.cookie("jwt", token,{
            domain: '.peakture.fr',
            httpOnly: true, // prevent XSS attacks cross-site scripting attacks
            sameSite:"None", // CSRF attacks cross-site request forgery attacks
            secure: true, 
    
        })
    } else {
        const sessionId = uuidv4()

        res.cookie("sessionId", sessionId,{
            domain: '.peakture.fr',
            httpOnly: false, // prevent XSS attacks cross-site scripting attacks
            sameSite:"None", // CSRF attacks cross-site request forgery attacks
            secure: true, 
    
        })

        return sessionId
    }
    

    
}