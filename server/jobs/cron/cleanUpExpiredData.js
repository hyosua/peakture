import cron from 'node-cron'
import Family from '../../models/family.model.js'
import Guest from '../../models/guest.model.js'
import mongoose from 'mongoose'

const cleanGuestReferences = async () => {
    try {
        console.log("Début du nettoyage des invités expirés");

        // Étape 1 : Supprimer les invités expirés (créés il y a plus de 24h)
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h en arrière
        const expiredGuests = await Guest.find({ createdAt: { $lt: cutoffDate } }, '_id');
        const expiredGuestIds = expiredGuests.map(g => g._id);

        const deleteResult = await Guest.deleteMany({ _id: { $in: expiredGuestIds } });
        console.log(`Invités expirés supprimés : ${deleteResult.deletedCount}`);

        // Étape 2 : Supprimer leurs références dans les familles
        if (expiredGuestIds.length > 0) {
            const updateResult = await Family.updateMany(
                {},
                {
                    $pull: {
                        guestMembers: { $in: expiredGuestIds }
                    }
                }
            );
            console.log(`Familles mises à jour : ${updateResult.modifiedCount}`);
        } else {
            console.log("Aucun invité expiré à supprimer");
        }

        console.log("Nettoyage terminé");
    } catch (error) {
        console.error("Erreur lors du nettoyage :", error);
    }
};

cron.schedule('0 43 7 * * *', cleanGuestReferences, {
    scheduled: true,
    timezone: "Europe/Paris"
});

export default cleanGuestReferences