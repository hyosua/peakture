import mongoose from "mongoose"

const guestSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        unique: true,
        required: true
    },
    families: [{ type: mongoose.Schema.Types.ObjectId, ref: "Family"}],
    expiresAt: {type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 } //Expire dans 7 jours
})

const Guest = mongoose.model("Guest", guestSchema)

export default Guest
