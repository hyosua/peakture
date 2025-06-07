import cron from 'node-cron'
import mongoose from 'mongoose'
import Album from '../../models/album.model.js'

const closeAlbum = async () => {
    try {
        console.log("Début de la cloture automatique des albums");

        // Etape 1: Récupérer les albums ayant le statut "countdown" et dont la date de countdown est passée
        const now = new Date();
        const albumsToClose = await Album.find({
            status: "countdown",
            countdownDate: { $lt: now }
        });
        console.log(`Nombre d'albums à cloturer : ${albumsToClose.length}`);
        if (albumsToClose.length === 0) {
            console.log("Aucun album à cloturer");
            return;
        }
        // Etape 2: Mettre à jour le statut de ces albums à "closed"
        const albumIds = albumsToClose.map(album => album._id);
        const updateResult = await Album.updateMany(
            { _id: { $in: albumIds } },
            { status: "closed" }
        );
        console.log(`Albums cloturés : ${updateResult.modifiedCount}`);

        console.log("Cloture automatique terminée");
    } catch (error) {
        console.error("Erreur lors de la cloture des albums :", error);
    }
};

cron.schedule('0 43 7 * * *', closeAlbum, {
    scheduled: true,
    timezone: "Europe/Paris"
});

export default closeAlbum