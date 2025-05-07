// tests/assignPoints.test.js

import { assignPoints } from "../services/album.service.js";
import Photo from "../models/photo.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

jest.mock("../models/photo.model.js");
jest.mock("../models/user.model.js");

describe("assignPoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId1 = new mongoose.Types.ObjectId();
  const userId2 = new mongoose.Types.ObjectId();
  const userId3 = new mongoose.Types.ObjectId();
  const userId4 = new mongoose.Types.ObjectId();

  it("doit correctement calculer et assigner les points", async () => {
    const fakePhotos = [
      {
        userId: userId1,
        votes: 2,
        votedBy: [userId3, userId4]
      },
      {
        userId: userId2,
        votes: 1,
        votedBy: [userId1]
      }
    ];

    User.bulkWrite.mockResolvedValueOnce(true);

    await assignPoints(fakePhotos);

    // Vérifier que bulkWrite a été appelé avec les bonnes mises à jour
    expect(User.bulkWrite).toHaveBeenCalled();
    
    const bulkWriteArgs = User.bulkWrite.mock.calls[0][0];
    
    // Créer un Map des mises à jour pour faciliter la vérification
    const updatesMap = new Map();
    bulkWriteArgs.forEach(update => {
      updatesMap.set(update.updateOne.filter._id.toString(), update.updateOne.update.$inc.score);
    });
    
    // User 1: Participation (2) + Votes reçus (2*3=6) + A voté (1) = 9 points
    expect(updatesMap.get(userId1.toString())).toBe(9);
    
    // User 2: Participation (2) + Votes reçus (1*3=3) = 5 points
    expect(updatesMap.get(userId2.toString())).toBe(5);
    
    // User 3: A voté (1) = 1 point
    expect(updatesMap.get(userId3.toString())).toBe(1);
    
    // User 4: A voté (1) = 1 point
    expect(updatesMap.get(userId4.toString())).toBe(1);
    
    // Vérifier qu'il y a exactement 4 mises à jour
    expect(bulkWriteArgs.length).toBe(4);
  });
});