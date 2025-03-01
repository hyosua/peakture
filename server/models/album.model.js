import mongoose from 'mongoose'

const albumSchema = new mongoose.Schema({
    month:{
        type: String,
        required: true,
        unique: true,
    },
    theme:{
        type: String,
        required: true,
    },
    cover:{
        type: String,
    },
    familyId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Family'
    },

},{timestamps: true})

const Album = mongoose.model("Album", albumSchema)

export default Album