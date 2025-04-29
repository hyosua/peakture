import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid' // génère un sessionid unique

export const generateTokenAndSetCookie = (res, userId=null) => {

    if(userId){
        const token = jwt.sign({ userId }, process.env.JWT_SECRET,{
            expiresIn: '15d'
        })

        res.cookie("jwt", token,{
            maxAge: 15*24*60*60*1000, //15 days in ms
            httpOnly: true, // prevent XSS attacks cross-site scripting attacks
            sameSite:"none", // CSRF attacks cross-site request forgery attacks
            secure: true, 
    
        })
    } else {
        const sessionId = uuidv4()

        res.cookie("sessionId", sessionId,{
            maxAge: 24 * 60 * 60 * 1000, // 1 jour en millisecondes
            httpOnly: false,
            sameSite:"none", // CSRF attacks cross-site request forgery attacks
            secure: true, 
    
        })

        return sessionId
    }
    

    
}