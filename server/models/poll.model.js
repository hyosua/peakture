import mongoose from "mongoose"

const optionSchema = new mongoose.Schema({
    theme: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        default: 0,
        min: 0
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'addedByModel'
    },
    addedByModel: {
        type: String,
        enum: ['User', 'Guest']
    },

}, { id: true })

const pollSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    options: [optionSchema],
    votes: [{
        optionId: { type: mongoose.Schema.Types.ObjectId },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'adminModel'
    },
    family: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family'
    },
    month: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["closed", "countdown"],
        default: "countdown",
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true
    },
    adminModel: {
        type: String,
        enum: ['User', 'Guest']
    },

},{timestamps: true})

const Poll = mongoose.model("Poll", pollSchema)

export default Poll