import cron from 'node-cron'
import Family from '../../models/family.model.js'
import Guest from '../../models/guest.model.js'

const cleanGuestReferences = async () => {
    try{
        console.log("Nettoyage des reférences aux invités expirés")

        const result = await Family.updateMany(
            { guestMembers: { $exists: true, $ne: [], $not: { $in: await Guest.distinct("_id") } } },
            { $pull: { guestMembers: { $nin: await Guest.distinct("_id") } } }
        )

        console.log(`Nettoyage terminé: ${result.modifiedCount} familles mises à jour`);
    } catch (error) {
        console.log("Erreur lors du nettoyage des refs aux invités expirés", error)
    }
}

cron.schedule('0 43 7 * * *', cleanGuestReferences,{
    scheduled: true,
    timezone: "Europe/Paris" 
})

export default cleanGuestReferences