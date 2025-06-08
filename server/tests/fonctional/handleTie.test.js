jest.mock('../../services/album.service.js', () => ({
  checkTie: jest.fn(),
  assignRandomWinningPhoto: jest.fn(),
  getUserOrGuestById: jest.fn(),
  setTieBreak: jest.fn(),
  shouldResolveTieWithPreviousWinner: jest.fn(),
  assignWinnerRandomly: jest.fn()
}));



// Mocks pour les dépendances externes
jest.mock('../../models/user.model.js');
jest.mock('../../models/guest.model.js');
jest.mock('../../models/photo.model.js');
jest.mock('../../models/album.model.js');
jest.mock('../../lib/utils/sendEmail.js'); // Pour sendTieNotification
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

import User from '../../models/user.model.js';
import Guest from '../../models/guest.model.js';
import Photo from '../../models/photo.model.js';
import Album from '../../models/album.model.js';
import { sendTieNotification } from '../../lib/utils/sendEmail.js';
import * as albumService from '../../services/album.service.js';


import { handleTie } from '../../controllers/album.controller.js';

describe('handleTie Controller', () => {
    let req, res;

    beforeEach(() => {
        // Configuration des mocks pour req et res
        req = {
            params: { id: '6810d9e27dc64b463e361c5e' },
            body: { familyId: '6810d9ce7dc64b463e361c47' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Reset des mocks
        jest.clearAllMocks();
    });

    describe('Cas de succès', () => {
        test('devrait retourner une erreur 400 si pas d\'égalité détectée', async () => {
            // Arrange
            const mockPhotos = [
                { _id: 'photo1', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo2', votes: 8, albumId: '6810d9e27dc64b463e361c5e' }
            ];

            Photo.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockPhotos)
            });

            // Act
            await handleTie(req, res);

            // Assert
            expect(Photo.find).toHaveBeenCalledWith({ albumId: '6810d9e27dc64b463e361c5e' });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                message: "Pas d'égalité détectée." 
            });
        });

        test('devrait résoudre l\'égalité avec le précédent vainqueur', async () => {
            // Arrange
            const mockTiedPhotos = [
                { _id: 'photo1', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo2', votes: 10, albumId: '6810d9e27dc64b463e361c5e' }
            ];

            const mockLastClosedAlbum = {
                _id: 'lastAlbum',
                familyId: '6810d9ce7dc64b463e361c47',
                status: 'closed',
                winnerId: 'winner123',
                createdAt: new Date()
            };

            const mockLastWinner = {
                _id: 'winner123',
                username: 'JohnDoe'
            };

            const mockTieBreak = {
                pendingTieAlbum: { _id: 'pendingAlbum' },
                updatedTiedPhotos: mockTiedPhotos
            };

            Photo.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTiedPhotos)
            });

            Album.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockLastClosedAlbum)
            });

            albumService.shouldResolveTieWithPreviousWinner.mockReturnValue(true);
            albumService.getUserOrGuestById.mockResolvedValue(mockLastWinner);
            albumService.setTieBreak.mockResolvedValue(mockTieBreak);

            // Act
            await handleTie(req, res);

            // Assert
            expect(Album.findOne).toHaveBeenCalledWith({ 
                familyId: '6810d9ce7dc64b463e361c47', 
                status: 'closed' 
            });
            expect(albumService.shouldResolveTieWithPreviousWinner).toHaveBeenCalledWith(
                mockLastClosedAlbum, 
                mockTiedPhotos
            );
            expect(albumService.getUserOrGuestById).toHaveBeenCalledWith('winner123');
            expect(albumService.setTieBreak).toHaveBeenCalledWith(
                mockLastWinner, 
                '6810d9e27dc64b463e361c5e', 
                mockTiedPhotos
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: `Le précédent vainqueur (${mockLastWinner.username}) doit départager les finalistes.`,
                pendingAlbum: mockTieBreak.pendingTieAlbum,
                updatedTiedPhotos: mockTieBreak.updatedTiedPhotos
            });
        });

        test('devrait assigner un gagnant aléatoirement', async () => {
            // Arrange
            const mockTiedPhotos = [
                { _id: 'photo1', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo2', votes: 10, albumId: '6810d9e27dc64b463e361c5e' }
            ];

            const mockRandomResult = {
                winnerId: 'randomWinner',
                updatedAlbum: { _id: '6810d9e27dc64b463e361c5e', status: 'closed' }
            };

            Photo.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTiedPhotos)
            });

            Album.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(null) // Pas d'album précédent
            });

            albumService.shouldResolveTieWithPreviousWinner.mockReturnValue(false);
            albumService.assignWinnerRandomly.mockResolvedValue(mockRandomResult);

            // Act
            await handleTie(req, res);

            // Assert
            expect(albumService.assignWinnerRandomly).toHaveBeenCalledWith('6810d9e27dc64b463e361c5e', mockTiedPhotos);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                winnerId: mockRandomResult.winnerId,
                updatedAlbum: mockRandomResult.updatedAlbum
            });
        });

        test('devrait gérer le cas où il y a exactement une égalité (2 photos)', async () => {
            // Arrange
            const mockTiedPhotos = [
                { _id: 'photo1', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo2', votes: 10, albumId: '6810d9e27dc64b463e361c5e' }
            ];

            Photo.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTiedPhotos)
            });

            Album.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(null)
            });

            albumService.shouldResolveTieWithPreviousWinner.mockReturnValue(false);
            albumService.assignWinnerRandomly.mockResolvedValue({
                winnerId: 'winner',
                updatedAlbum: { _id: '6810d9e27dc64b463e361c5e' }
            });

            // Act
            await handleTie(req, res);

            // Assert
            expect(albumService.assignWinnerRandomly).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Cas d\'erreur', () => {
        test('devrait gérer les erreurs de base de données', async () => {
            // Arrange
            const mockError = new Error('Database connection failed');
            Photo.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(mockError)
            });

            // Spy sur console.error
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Act
            await handleTie(req, res);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Error in handleTie Controller:', mockError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Erreur pour trouver un gagnant:',
                error: mockError.message
            });

            // Restore console.error
            consoleSpy.mockRestore();
        });

        test('devrait gérer les erreurs dans setTieBreak', async () => {
            // Arrange
            const mockTiedPhotos = [
                { _id: 'photo1', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo2', votes: 10, albumId: '6810d9e27dc64b463e361c5e' }
            ];

            const mockError = new Error('TieBreak failed');

            Photo.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTiedPhotos)
            });

            Album.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue({ winnerId: 'winner123' })
            });

            albumService.shouldResolveTieWithPreviousWinner.mockReturnValue(true);
            albumService.getUserOrGuestById.mockResolvedValue({ username: 'TestUser' });
            albumService.setTieBreak.mockRejectedValue(mockError);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Act
            await handleTie(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Erreur pour trouver un gagnant:',
                error: mockError.message
            });

            consoleSpy.mockRestore();
        });

        test('devrait gérer les erreurs dans assignWinnerRandomly', async () => {
            // Arrange
            const mockTiedPhotos = [
                { _id: 'photo1', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo2', votes: 10, albumId: '6810d9e27dc64b463e361c5e' }
            ];

            const mockError = new Error('Random assignment failed');

            Photo.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTiedPhotos)
            });

            Album.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(null)
            });

            albumService.shouldResolveTieWithPreviousWinner.mockReturnValue(false);
            albumService.assignWinnerRandomly.mockRejectedValue(mockError);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Act
            await handleTie(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            consoleSpy.mockRestore();
        });
    });

    describe('Validation des paramètres', () => {
        test('devrait fonctionner avec des IDs valides', async () => {
            // Arrange
            req.params.id = 'validAlbumId';
            req.body.familyId = 'validFamilyId';

            const mockPhotos = [
                { _id: 'photo1', votes: 5, albumId: 'validAlbumId' }
            ];

            Photo.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockPhotos)
            });

            // Act
            await handleTie(req, res);

            // Assert
            expect(Photo.find).toHaveBeenCalledWith({ albumId: 'validAlbumId' });
            expect(res.status).toHaveBeenCalledWith(400); // Pas d'égalité
        });

        test('devrait gérer les cas avec plusieurs photos à égalité', async () => {
            // Arrange
            const mockPhotos = [
                { _id: 'photo1', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo2', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo3', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo4', votes: 8, albumId: '6810d9e27dc64b463e361c5e' }
            ];

            Photo.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockPhotos)
            });

            Album.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(null)
            });

            albumService.shouldResolveTieWithPreviousWinner.mockReturnValue(false);
            albumService.assignWinnerRandomly.mockResolvedValue({
                winnerId: 'winner',
                updatedAlbum: { _id: '6810d9e27dc64b463e361c5e' }
            });

            // Act
            await handleTie(req, res);

            // Assert
            expect(albumService.assignWinnerRandomly).toHaveBeenCalledWith('6810d9e27dc64b463e361c5e', [
                { _id: 'photo1', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo2', votes: 10, albumId: '6810d9e27dc64b463e361c5e' },
                { _id: 'photo3', votes: 10, albumId: '6810d9e27dc64b463e361c5e' }
            ]);
        });
    });
});