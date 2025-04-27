import mongoose from "mongoose"

const guestSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    role:{
        type: String,
        enum: ['admin', 'user'], default: 'user'
    },
    avatar:{
        type: String,
        default: "https://img.icons8.com/?size=100&id=91243&format=png&color=000000"
    },
    coverImage:{
        type: String,
        default: "https://res.cloudinary.com/djsj0pfm3/image/upload/v1745782856/sleeping-album_sowbvd.png"
    },
    score:{
        type: Number,
        default: 0,
    },
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family"},
    expiresAt: {type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000} //Expire dans 1 jour
})

guestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // nettoyer les données

const Guest = mongoose.model("Guest", guestSchema)

export default Guest
