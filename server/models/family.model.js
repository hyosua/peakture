import mongoose from "mongoose"

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    inviteCode: {
        type: String,
        unique: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    guestMembers: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Guest'
    }]
})

const Family = mongoose.model("Family", familySchema)

export default Family