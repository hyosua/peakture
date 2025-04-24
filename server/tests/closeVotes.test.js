import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import Album from '../models/album.model.js';
import Photo from '../models/photo.model.js';
import User from '../models/user.model.js';
import { sendTieNotification } from '../lib/utils/sendEmail.js';

vi.mock('../lib/utils/sendEmail.js', () => ({
  sendTieNotification: vi.fn()
}));

describe('album Controller', () => {
  let testAlbum;
  let user1, user2;
  let photo1, photo2;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/peakture-test');

    user1 = await User.create({ username: 'Alice', email: 'alice@example.com', password: 'TestPassword1!' });
    user2 = await User.create({ username: 'Bob', email: 'bob@example.com', password: 'TestPassword2!' });

    testAlbum = await Album.create({_id: "67f542fafa2168f2efec8e9a", familyId: '67eac690182ba7200062785f', status: "open", month: 1, theme: "Test" });

    photo1 = await Photo.create({ albumId: '67f542fafa2168f2efec8e9a', src:'peakture.jpg' , userId: user1._id, votes: 3 });
    photo2 = await Photo.create({ albumId: '67f542fafa2168f2efec8e9a', src: 'peakture2.jpg', userId: user2._id, votes: 3 });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Photo.deleteMany({});
    await Album.deleteMany({});
    await mongoose.connection.close();
  });

/*
  it('should randomly pick a winner if no previous winner exists or is among finalists', async () => {
    // Album sans winner précédent
  
    const res = await request(app)
      .patch(`/api/albums/${testAlbum._id}/tie`)
      .send({ familyId: testAlbum.familyId });
  
      
    expect(res.status).toBe(200);
    expect(res.body.updatedAlbum.status).toBe('closed');
    expect(res.body.updatedAlbum.winner).toBeDefined();
    expect(res.body.message).toMatch(/Le gagnant est/);
    expect(sendTieNotification).not.toHaveBeenCalled();
  });
  */

  it('should return "égalité" if at least the 2 most voted photos of the album have the same vote count', async () => {
    // // Créer un user "ancien gagnant"
    // const lastWinner = await User.create({
    //   username: 'Charlie',
    //   email: 'charlie@example.com',
    //   password: 'TestPassword3!'
    // });
  
    // // Créer un ancien album fermé avec ce gagnant
    // const lastClosedAlbum = await Album.create({
    //   familyId: testAlbum.familyId,
    //   winner: user1._id,
    //   status: "closed",
    //   month: 12,
    //   theme: 'Précédent',
    //   createdAt: new Date(Date.now() - 86400000) // 1 jour avant
    // });
  
    // Reset status de l'album actuel
    await Album.findByIdAndUpdate(testAlbum._id, { status: "open" });
  
    const res = await request(app)
      .patch(`/api/albums/${testAlbum._id}/close-votes`)
      .send({ familyId: testAlbum.familyId });
    
    expect(res.status).toBe(400);
    console.log('res.body:', res.body)
    // expect(res.body.updatedAlbum.status).toBe('closed')
  });
  
});
