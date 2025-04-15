    // services/assignPoints.js

import Photo from "../models/photo.model.js";
import User from "../models/user.model.js"

export  const assignPoints = async (photos) => {
    try{
        if(!photos || photos.length === 0){
            return
        }
        const updates = photos.map(async (photo, index) => {
            let points = photo.votes + 3;
            if(index === 0) points += 20
            else if(index === 1) points += 10
            else if(index ===2) points += 5
            
            // On vérifie si l'utilisateur a voté pour une photo
            const hasVoted = await Photo.findOne({ votedBy: { $in: [photo.userId] } });
            if(hasVoted){
                console.log(`L'utilisateur ${photo.username} a voté pour une photo`)
                points += 3
            }

            return User.findByIdAndUpdate(
                photo.userId,
                { $inc: { score: points } },
                { new: true }
            )
        })

        await Promise.all(updates)
        console.log('Points assignés avec succès')
    }catch(error){
        console.error('Error in album.service assignPoints:', error);
        throw new Error('Erreur lors de l\'assignation des points');
    }
    
}