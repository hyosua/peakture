import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 6,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    role:{
        type: String,
        enum: ['admin', 'user'], default: 'user'
    },
    familyId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Family'
    },
    avatar:{
        exists: {
            type: Boolean,
            default: 'false',
            },
        imageLink: {
            type: String,
            trim: true,
            default: 'null',
        },
    },
    score:{
        type: Number,
        default: 0,
    }

},{timestamps: true})

const User = mongoose.model("User", userSchema)

export default User