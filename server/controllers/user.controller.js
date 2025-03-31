import User from "../models/user.model.js"
import Guest from "../models/guest.model.js"
import { ObjectId } from "mongodb";

export const getUserData = async (req, res) => {
    try{
        const userId = req.params.userid
        let user = await User.findOne({ _id: new ObjectId(userId) })

        if(!user){
            user = await Guest.findOne({ _id: new ObjectId(userId) })
            if(!user){
                console.log("Oops Utilisateur non trouvé")
                return res.status(404).json({message: "Utilisateur non trouvé"})
            }
        }
        return res.status(200).json(user)
    }catch(error){
        console.error("Erreur dans User Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }  
}
