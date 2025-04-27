import mongoose from 'mongoose'

const albumSchema = new mongoose.Schema({
    year:{
        type: Number,
        required: true,
    },
    month:{
        type: Number,
        required: true,
    },
    theme:{
        type: String,
        required: true,
    },
    cover:{
        type: String,
    },
    status: {
        type: String,
        enum: ["open", "tie-break", "closed"],
        default: "open",
        required: true,
    },
    tieBreakJudge: { // l'utilisateur qui doit départager (ancien gagnant)
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        refPath: 'userModel'
      },
    userModel: {
    type: String,
    enum: ['User', 'Guest']
    },
    isRandomWinner: {
        type: Boolean,
        default: false
    },
    peakture:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Photo'
    },
    familyId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Family',required: true 
    },

},{timestamps: true})

albumSchema.index({ month: 1, familyId: 1 }, { unique: true });

const Album = mongoose.model("Album", albumSchema)

export default Album