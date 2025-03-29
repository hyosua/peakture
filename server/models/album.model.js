import mongoose from 'mongoose'

const albumSchema = new mongoose.Schema({
    month:{
        type: String,
        required: true,
    },
    theme:{
        type: String,
        required: true,
    },
    cover:{
        type: String,
    },
    closed:{
        type: Boolean,
        default: false,
    },
    winner:{
        type: Object,
        default: null
    },
    familyId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Family',required: true 
    },

},{timestamps: true})

albumSchema.index({ month: 1, familyId: 1 }, { unique: true });

const Album = mongoose.model("Album", albumSchema)

export default Album