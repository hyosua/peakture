import User from '../models/user.model.js'
import Photo from '../models/photo.model.js'
import Album from '../models/album.model.js'


export const getClassementAnnuel = async (req, res) => {
    try {
        const familyId = req.params.familyId
        const classement = await User.find({ familyId })
                                    .select('username avatar score')
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

export const getClassementMensuel = async (req, res) => {
    try {
        const familyId = req.params.familyId
        const lastAlbum = await Album.findOne({familyId, status: "closed"}).sort({ createdAt: -1 })
        if(!lastAlbum){
            return res.status(404).json({ message: "Aucun album clos"})
        }
        const photos = await Photo.find({albumId: lastAlbum._id})
                                    .select('userId votes userModel')
                                    .populate('userId','username avatar')
                                    .sort({ votes: -1 });
        if(!photos || photos.length === 0){
            return res.status(404).json({ message: "Pas de photos" })
        }

        const classement = photos.map(photo => ({
            user: photo.userId,
            votes: photo.votes
        }))
        res.status(200).json({ classement, album: lastAlbum })
    }catch (error){
        console.log("Error in getClassementMensuel controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

export const getClassementAlbum = async (req, res) => {
    try {
        const albumId = req.params.id
        const album = await Album.findById(albumId)
        if(!album){
            return res.status(404).json({ success: false, message: "Aucun album clos ne correspond"})
        }
        const photos = await Photo.find({albumId})
                        .select('userId votes username userModel')
                        .populate({
                            path: 'userId',
                            select: 'username avatar'
                        })
                        .sort({ votes: -1 });

        if(!photos || photos.length === 0){
            return res.status(404).json({ success: false, message: "Pas de photos" })
        }

        const classement = photos.map(photo => ({
            user: photo.userId,
            votes: photo.votes
        }))
        res.status(200).json({ success: true, classement, album })
    }catch (error){
        console.log("Error in getClassementAlbum controller", error.message)
        return res.status(500).json({ error: "Internal Server Error"})
    }
}

