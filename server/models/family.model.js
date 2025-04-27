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
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'userModel'
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel'
    },
    guestMembers: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Guest'
    }],
    userModel: {
        type: String,
        enum: ['User', 'Guest']
    },
})

const Family = mongoose.model("Family", familySchema)

export default Family