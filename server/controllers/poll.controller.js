import Family from '../models/family.model.js'
import User from '../models/user.model.js'
import Guest from '../models/guest.model.js'
import Album from '../models/album.model.js'


import Photo from '../models/photo.model.js'
import Poll from '../models/poll.model.js'


export const create = async (req, res) => {
    try {
        const { options, admin, family, month, expiresAt} = req.body
        if(!options || options.length < 2){
            return res.status(400).json({success: false, message: "Il faut au moins deux options pour créer un sondage."})
        }   
        const title = `Quel sera le thème de ${month} ?`
        const poll = await Poll.create({
            title,
            options,
            admin,
            family,
            month,
            expiresAt,
        })
        res.status(201).json({ success: true, message: "Sondage créé avec succès", poll })
    }catch (error){
        console.log("Error in poll controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const getPoll = async (req, res) => {
    try{
        const familyId = req.params.id
        if(!familyId){
            return res.status(400).json({ message: "Aucune famille trouvée" })
        }
        const poll = await Poll.findOne({ family: familyId })
        return res.json(poll)
    }catch (error){
        console.error("Erreur dans getPoll Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }
}
