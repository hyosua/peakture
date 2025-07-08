import cron from 'node-cron'
import mongoose from 'mongoose'
import Album from '../../models/album.model.js'
import Photo from '../../models/photo.model.js'
import { closeAlbumService } from '../../services/closeAlbum.service.js'

const closeAlbum = async () => {
    try {
        console.log("Début de la cloture automatique des albums");

        // Etape 1: Récupérer les albums ayant le statut "countdown" et dont la date de countdown est passée
        const now = new Date();
        const albumsToClose = await Album.find({
            status: "countdown",
            expiresAt: { $lt: now }
        });
        console.log(`Nombre d'albums à cloturer : ${albumsToClose.length}`);
        if (albumsToClose.length === 0) {
            console.log("Aucun album à cloturer");
            return;
        }
        // Etape 2: Clôturer les albums
        for (const album of albumsToClose) {
            console.log(`Clôture de l'album ${album._id}`);
            const updatedAlbum = await closeAlbumService(album._id, album.familyId);
            if (updatedAlbum.status === 'tie-break') {
                console.log(`L'album ${album._id} est en tie-break`);
            } else {
                console.log(`L'album ${album._id} a été cloturé avec un gagnant`);
                // Mettre à jour les photos restantes pour qu'elles ne soient plus en égalité
                await Photo.updateMany(
                    { albumId: album._id },
                    { $set: { isTied: false } }
                );
            }
            
        }

        console.log("Cloture automatique terminée");
    } catch (error) {
        console.error("Erreur lors de la cloture des albums :", error);
    }
};

cron.schedule('0 52 11 * * *', closeAlbum, {
    scheduled: true,
    timezone: "Europe/Paris"
});

export default closeAlbum