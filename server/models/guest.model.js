import mongoose from "mongoose"

const guestSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        unique: true,
        required: true
    },
    families: [{ type: mongoose.Schema.Types.ObjectId, ref: "Family"}],
    expiresAt: {type: Date, default: () => Date.now() + 30 * 60 * 1000 } //Expire dans 30 minutes
})

guestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // nettoyer les données

const Guest = mongoose.model("Guest", guestSchema)

export default Guest
