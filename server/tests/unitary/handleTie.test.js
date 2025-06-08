import {
    checkTie,
    assignRandomWinningPhoto,
    getUserOrGuestById,
    setTieBreak,
    shouldResolveTieWithPreviousWinner,
    assignWinnerRandomly
} from '../../services/album.service.js';

// Mocks pour les dépendances externes
jest.mock('../models/user.model.js');
jest.mock('../models/guest.model.js');
jest.mock('../models/photo.model.js');
jest.mock('../models/album.model.js');
jest.mock('../lib/utils/sendEmail.js'); // Pour sendTieNotification
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));


import User from '../../models/user.model.js';
import Guest from '../../models/guest.model.js';
import Photo from '../../models/photo.model.js';
import Album from '../../models/album.model.js';
import { sendTieNotification } from '../../lib/utils/sendEmail.js';

describe('checkTie', () => {
    test('retourne false quand il y a moins de 2 photos', () => {
        expect(checkTie([])).toBe(false);
        expect(checkTie([{ votes: 5 }])).toBe(false);
    });

    test('retourne false quand il n\'y a pas d\'égalité', () => {
        const photos = [
            { votes: 10 },
            { votes: 8 },
            { votes: 6 }
        ];
        expect(checkTie(photos)).toBe(false);
    });

    test('retourne true quand il y a égalité entre les premiers', () => {
        const photos = [
            { votes: 10 },
            { votes: 10 },
            { votes: 6 }
        ];
        expect(checkTie(photos)).toBe(true);
    });

    test('retourne true quand toutes les photos sont à égalité', () => {
        const photos = [
            { votes: 5 },
            { votes: 5 },
            { votes: 5 }
        ];
        expect(checkTie(photos)).toBe(true);
    });

    test('ne modifie pas le tableau original lors du tri', () => {
        const photos = [
            { votes: 5 },
            { votes: 10 },
            { votes: 8 }
        ];
        const originalOrder = [...photos];
        checkTie(photos);
        expect(photos).toEqual(originalOrder);
    });

    test('gère les erreurs et les relance', () => {
        const invalidPhotos = null;
        expect(() => checkTie(invalidPhotos)).toThrow();
    });

    test('log les erreurs avant de les relancer', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const invalidPhotos = null;
        
        try {
            checkTie(invalidPhotos);
        } catch (error) {
            console.log(" Expected error caught:", error);
        }
        
        expect(consoleSpy).toHaveBeenCalledWith('ERROR in checkTie:', expect.any(Error));
        consoleSpy.mockRestore();
    });
});

describe('assignRandomWinningPhoto', () => {
    beforeEach(() => {
        // Mock Math.random pour des tests prévisibles
        jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        Math.random.mockRestore();
    });

    test('retourne null pour un tableau vide', () => {
        expect(assignRandomWinningPhoto([])).toBeNull();
    });

    test('retourne null pour un paramètre null/undefined', () => {
        expect(assignRandomWinningPhoto(null)).toBeNull();
        expect(assignRandomWinningPhoto(undefined)).toBeNull();
    });

    test('retourne la seule photo disponible', () => {
        Math.random.mockReturnValue(0);
        const photos = [{ id: 1, votes: 5 }];
        expect(assignRandomWinningPhoto(photos)).toEqual({ id: 1, votes: 5 });
    });

    test('retourne une photo aléatoire parmi plusieurs', () => {
        Math.random.mockReturnValue(0.7); // Devrait sélectionner l'index 2 sur 3 éléments
        const photos = [
            { id: 1, votes: 5 },
            { id: 2, votes: 5 },
            { id: 3, votes: 5 }
        ];
        expect(assignRandomWinningPhoto(photos)).toEqual({ id: 3, votes: 5 });
    });


describe('getUserOrGuestById', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retourne un utilisateur quand il existe', async () => {
        const mockUser = { _id: '123', name: 'John', type: 'user' };
        User.findById.mockResolvedValue(mockUser);
        Guest.findById.mockResolvedValue(null);

        const result = await getUserOrGuestById('123');
        expect(result).toEqual(mockUser);
        expect(User.findById).toHaveBeenCalledWith('123');
    });

    test('retourne un invité quand l\'utilisateur n\'existe pas', async () => {
        const mockGuest = { _id: '123', name: 'Jane', type: 'guest' };
        User.findById.mockResolvedValue(null);
        Guest.findById.mockResolvedValue(mockGuest);

        const result = await getUserOrGuestById('123');
        expect(result).toEqual(mockGuest);
        expect(User.findById).toHaveBeenCalledWith('123');
        expect(Guest.findById).toHaveBeenCalledWith('123');
    });

    test('retourne null quand ni utilisateur ni invité n\'existent', async () => {
        User.findById.mockResolvedValue(null);
        Guest.findById.mockResolvedValue(null);

        const result = await getUserOrGuestById('123');
        expect(result).toBeNull();
    });
});

describe('setTieBreak', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('met à jour les photos liées et l\'album avec succès', async () => {
        const lastWinner = { email: 'winner@test.com', name: 'Winner', _id: 'winner123' };
        const albumId = 'album123';
        const tiePhotos = [
            { _id: 'photo1' },
            { _id: 'photo2' }
        ];

        const mockUpdatedPhotos = { modifiedCount: 2 };
        const mockUpdatedAlbum = { _id: albumId, status: 'tie-break', tieBreakJudge: 'winner123' };

        sendTieNotification.mockResolvedValue();
        Photo.updateMany.mockResolvedValue(mockUpdatedPhotos);
        Album.findByIdAndUpdate.mockResolvedValue(mockUpdatedAlbum);

        const result = await setTieBreak(lastWinner, albumId, tiePhotos);

        expect(sendTieNotification).toHaveBeenCalledWith('winner@test.com', 'Winner', 'album123');
        expect(Photo.updateMany).toHaveBeenCalledWith(
            { _id: { $in: ['photo1', 'photo2'] } },
            { $set: { isTied: true } }
        );
        expect(Album.findByIdAndUpdate).toHaveBeenCalledWith(
            'album123',
            { status: 'tie-break', tieBreakJudge: 'winner123' },
            { new: true }
        );

        expect(result).toEqual({
            updatedTiedPhotos: mockUpdatedPhotos,
            pendingTieAlbum: mockUpdatedAlbum
        });
    });

    test('lance une erreur si la mise à jour de l\'album échoue', async () => {
        const lastWinner = { email: 'winner@test.com', name: 'Winner', _id: 'winner123' };
        const albumId = 'album123';
        const tiePhotos = [{ _id: 'photo1' }];

        sendTieNotification.mockResolvedValue();
        Photo.updateMany.mockResolvedValue({ modifiedCount: 1 });
        Album.findByIdAndUpdate.mockResolvedValue(null);

        await expect(setTieBreak(lastWinner, albumId, tiePhotos))
            .rejects.toThrow('Failed to update album status to tie-break');
    });
});

describe('shouldResolveTieWithPreviousWinner', () => {
    test('retourne false si lastAlbum est null/undefined', () => {
        const tiedPhotos = [{ userId: 'user1' }];
        expect(shouldResolveTieWithPreviousWinner(null, tiedPhotos)).toBe(false);
        expect(shouldResolveTieWithPreviousWinner(undefined, tiedPhotos)).toBe(false);
    });

    test('retourne false si le gagnant précédent est parmi les photos liées', () => {
        const lastAlbum = { winnerId: 'user1' };
        const tiedPhotos = [
            { userId: 'user1' },
            { userId: 'user2' }
        ];
        expect(shouldResolveTieWithPreviousWinner(lastAlbum, tiedPhotos)).toBe(false);
    });

    test('retourne true si le gagnant précédent n\'est pas parmi les photos liées', () => {
        const lastAlbum = { winnerId: 'user1' };
        const tiedPhotos = [
            { userId: 'user2' },
            { userId: 'user3' }
        ];
        expect(shouldResolveTieWithPreviousWinner(lastAlbum, tiedPhotos)).toBe(true);
    });

    test('gère la conversion toString() pour la comparaison', () => {
        const lastAlbum = { winnerId: { toString: () => 'user1' } };
        const tiedPhotos = [
            { userId: { toString: () => 'user2' } },
            { userId: { toString: () => 'user3' } }
        ];
        expect(shouldResolveTieWithPreviousWinner(lastAlbum, tiedPhotos)).toBe(true);
    });
});

describe('assignWinnerRandomly', () => {
    let mathRandomSpy;

    beforeEach(() => {
        mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        mathRandomSpy.mockRestore();
    });

    test('assigne un gagnant aléatoirement et met à jour la base de données', async () => {
        const albumId = 'album123';
        const tiePhotos = [
            { _id: 'photo1', userId: 'user1', votes: 5 },
            { _id: 'photo2', userId: 'user2', votes: 5 }
        ];

        const mockUpdatedPhoto = {
            _id: 'photo2',
            userId: 'user2',
            votes: 6,
            src: 'photo2.jpg'
        };

        const mockUpdatedAlbum = {
            _id: albumId,
            winnerId: 'user2',
            peakture: 'photo2',
            status: 'closed',
            cover: 'photo2.jpg'
        };

        // Mock de Photo.findByIdAndUpdate
        Photo.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedPhoto);

        // Crée un objet mockQuery pour chaîner les populates
        const mockQuery = {
            populate: jest.fn().mockImplementation(() => mockQuery), // permet le chaining
            then: jest.fn().mockImplementation(fn => {
                fn(mockUpdatedAlbum);
                return Promise.resolve(mockUpdatedAlbum);
            }),
        };

        // Mock de Album.findOneAndUpdate pour retourner une "query"
        Album.findOneAndUpdate = jest.fn().mockReturnValue(mockQuery);

        const result = await assignWinnerRandomly(albumId, tiePhotos);

        expect(Photo.findByIdAndUpdate).toHaveBeenCalledWith(
            'photo2',
            { $inc: { votes: 1 } },
            { new: true }
        );

        expect(Album.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: albumId },
            {
                $set: {
                    winnerId: 'user2',
                    peakture: mockUpdatedPhoto._id,
                    status: 'closed',
                    cover: mockUpdatedPhoto.src
                }
            },
            { new: true }
        );

        expect(mockQuery.populate).toHaveBeenCalledWith('winnerId');
        expect(mockQuery.populate).toHaveBeenCalledWith('peakture');

        expect(result).toEqual({
            winnerId: 'user2',
            updatedAlbum: mockUpdatedAlbum
        });
    });


    test('gère le cas où assignRandomWinningPhoto retourne null', async () => {
        // Mock pour que assignRandomWinningPhoto retourne null
        jest.doMock('./votre-fichier', () => ({
            ...jest.requireActual('./votre-fichier'),
            assignRandomWinningPhoto: jest.fn(() => null)
        }));

        const albumId = 'album123';
        const tiePhotos = [];

        await expect(assignWinnerRandomly(albumId, tiePhotos)).rejects.toThrow();
    });
});

// Tests d'intégration pour vérifier les interactions entre fonctions
describe('Tests d\'intégration', () => {
    test('checkTie et assignRandomWinningPhoto fonctionnent ensemble', () => {
        const photos = [
            { votes: 10, id: 1 },
            { votes: 10, id: 2 },
            { votes: 8, id: 3 }
        ];

        const hasTie = checkTie(photos);
        expect(hasTie).toBe(true);

        const tiedPhotos = photos.filter(photo => photo.votes === 10);
        const winner = assignRandomWinningPhoto(tiedPhotos);
        expect([1, 2]).toContain(winner.id);
    });
})
}
);