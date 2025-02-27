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
    profileImg:{
        type: String,
        default: "",
    }

},{timestamps: true})

const User = mongoose.model("User", userSchema)

export default User