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
    },
    user:{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    

},{timestamps: true})

const Photo = mongoose.model("Photo", photoSchema)

export default Photo