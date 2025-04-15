import mongoose from 'mongoose'

const photoSchema = new mongoose.Schema({
    albumId:{
        type: String,
        required: true,
    },
    src:{
        type: String,
        required: true,
    },
    votes:{
        type: Number,
        default: 0,
    },
    userId:{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    username:{
        type: String, ref: 'User'
    },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isTied:{
        type: Boolean,
        default: false
    },

},{timestamps: true})

const Photo = mongoose.model("Photo", photoSchema)

export default Photo