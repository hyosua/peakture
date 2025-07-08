// services/album.service.js

import Album from "../models/album.model.js";

export const isCountdown = async (albumId) => {
    if(!albumId) {
        throw new Error("Album ID is required to check countdown status");
    }
    const album = await Album.findOne({ albumId, status: "countdown" });
    return !!album;
}

export const isClosed = async (albumId) => {
    if(!albumId) {
        throw new Error("Album ID is required to check closed status");
    }
    const album = await Album.findOne({ albumId, status: "closed" });
    return !!album;
}

export const isCountdownEnded = async (albumId) => {
    if(!albumId) {
        throw new Error("Album ID is required to check countdown ended status");
    }
    const album = await Album.findOne({ albumId, status: "countdown" });
    if (!album) {
        return false;
    }
    const currentTime = new Date();
    return currentTime > album.expiresAt;
}

export const isCountdownActive = async (albumId) => {
    if(!albumId) {
        throw new Error("Album ID is required to check countdown active status");
    }
    const album = await Album.findOne({ albumId, status: "countdown" });
    if (!album) {
        return false;
    }
    const currentTime = new Date();
    return currentTime <= album.expiresAt;
}

