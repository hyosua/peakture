
import Poll from '../models/poll.model.js'


export const create = async (req, res) => {
    try {
        const { options, admin, family, month, expiresAt} = req.body
        console.log("Creating poll with data:", req.body)
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

export const vote = async (req, res) => {
    try {
        const { pollId, optionId } = req.body
        const userId = req.user._id
        const poll = await Poll.findById(pollId)
        if(!poll){
            return res.status(404).json({ success: false, message: "Sondage non trouvé" })
        }

        if(poll.status === "closed" || new Date() > poll.expiresAt){
            return res.status(400).json({ success: false, message: "Le sondage est terminé" })
        }

       const hasVoted = poll.votes.some(v => v.userId.equals(userId))

       if(hasVoted){
        return res.status(400).json({ success: false, message: "Tu as déjà voté dans ce sondage"})
       }
       console.log("User ID:", userId)
        console.log("Option ID:", optionId)
       const option = poll.options.find(o => o._id.equals(optionId))
       if(!option){
              return res.status(400).json({ success: false, message: "Option introuvable" })
       }

       option.votes += 1
       poll.votes.push({ optionId, userId })
       await poll.save()
        return res.status(200).json({ success: true, message: "Vote enregistré avec succès", poll })
    } catch (error) {
        console.error("Erreur dans poll Controller:", error.message)
        return res.status(500).json({ error: "Erreur interne du serveur." })
    }

}

