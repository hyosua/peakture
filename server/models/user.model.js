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
        type: String,
        default: "https://img.icons8.com/?size=100&id=91243&format=png&color=000000"
    },
    coverImage:{
        type: String,
        default: "http://localhost:5173/src/assets/img/lib/sleeping-cover.png"
    },
    score:{
        type: Number,
        default: 0,
    }

},{timestamps: true})

const User = mongoose.model("User", userSchema)

export default User