import mongooses from "mongoose"

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
})

const Family = mongoose.model("Family", familySchema)

export default Family