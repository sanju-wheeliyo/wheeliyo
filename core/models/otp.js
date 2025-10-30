import mongoose, { Schema, model } from 'mongoose'
import schemaNameConstants from 'core/constants/schemaConstants'

const otpSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 3, // otp will be automatically deleted after 3 minutes of its creation time
    },
    valid: {
        type: Boolean,
        default: true,
    },
})
export default mongoose?.models?.otp ||
    mongoose.model(schemaNameConstants.otpSchema, otpSchema)
