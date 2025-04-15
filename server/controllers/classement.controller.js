import User from '../models/user.model.js'
import Photo from '../models/photo.model.js'
import Album from '../models/album.model.js'


export const getClassementAnnuel = async (req, res) => {
    try {
        const familyId = req.params.familyId
        const classement = await User.find({ familyId })
                                    .select('username score')
                                    .sort({ score: -1 });
        if(!classement){
            return res.status(404).json({ message: "Aucun utilisateur dans le classement" })
        }

        res.status(200).json(classement)
    }catch (error){
        console.log("Error in getClassementAnnuel controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const getClassementAlbum = async (req, res) => {
    try {
        const familyId = req.params.familyId
        const lastAlbum = await Album.findOne({familyId, status: "closed"}).sort({ createdAt: -1 })
        if(!lastAlbum){
            return res.status(404).json({ message: "Aucun album clos"})
        }
        const classement = await Photo.find({albumId: lastAlbum._id})
                                    .select('username votes')
                                    .sort({ votes: -1 });
        if(!classement || classement.length === 0){
            return res.status(404).json({ message: "Pas de photos" })
        }

        res.status(200).json({ classement, album: lastAlbum })
    }catch (error){
        console.log("Error in getClassementLastAlbum controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

