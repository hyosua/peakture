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
        description:{
            type: String,
        },
        cover:{
            type: String,
        },
        status: {
            type: String,
            enum: ["open", "tie-break", "closed", "countdown"],
            default: "open",
            required: true,
        },
        countdownDate: {
            type: Date,
            required: false,
        },
        tieBreakJudge: { // l'utilisateur qui doit départager (ancien gagnant)
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
        },
        winnerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            refPath: 'winnerModel'
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'adminModel'
        },
        winnerModel: {
        type: String,
        enum: ['User', 'Guest']
        },
        adminModel: {
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