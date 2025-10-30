// models/otp.js
import mongoose from 'mongoose'

const OtpSchema_WA = new mongoose.Schema(
    {
        value: {
            type: String,
            required: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        valid: {
            type: Boolean,
            default: true,
        },
        type: {
            type: String,
            enum: ['phone', 'email', 'phone_update', 'login', 'registration'],
            default: 'phone',
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },

        // ✅ Add these fields
        name: {
            type: String,
        },
        city: {
            type: String,
        },
        email: {
            type: String,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
            },
        },
        // Additional context for phone updates
        currentUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
)

export default mongoose.models.Otp_WA || mongoose.model('Otp_WA', OtpSchema_WA)
