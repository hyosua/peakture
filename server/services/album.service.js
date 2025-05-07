    // services/assignPoints.js

import Photo from "../models/photo.model.js";
import User from "../models/user.model.js"

export const assignPoints = async (photos) => {
    try{
        if(!photos || photos.length === 0) return;

        const userPoints = {};
    
        for (const photo of photos) {
    
            const points = photo.votes * 3 +2; // 2 points pour la participation + 3 points par vote
    
            userPoints[photo.userId] = (userPoints[photo.userId] || 0) + points;
        }
        // Attribution de points supplémentaires pour les votants
        photos.forEach(photo => {
            if(photo.votedBy.length > 0) {
                photo.votedBy.forEach(voterId => {
                    userPoints[voterId] = (userPoints[voterId] || 0) + 1; // 1 point par vote   
                })
            }
        })
    
    
        const updates = Object.keys(userPoints).map(userId => ({
            updateOne: {
              filter: { _id: userId },
              update: { $inc: { score: userPoints[userId] } },
            }
        }));     
        
        // Exécuter la mise à jour
        await User.bulkWrite(updates);
        console.log('Points assignés avec succès');
    }catch (error) {
        console.error("ERROR in assignPoints:", error);
        console.error("Stack trace:", error.stack);
        throw error; // Re-throw the error after logging
    }

   
}