import mongoose from 'mongoose'

const photoSchema = new mongoose.Schema({
    albumId:{
        type: String,
        required: true,
        unique: true,
    },
    src:{
        type: String,
        required: true,
    },
    votes:{
        type: Number,
    }

},{timestamps: true})

const Photo = mongoose.model("Photo", photoSchema)

export default Photo