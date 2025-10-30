import mongoose, { Schema, model } from 'mongoose'
import schemaNameConstants from 'core/constants/schemaConstants'
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        country_code: {
            type: String,
        },
        city: {
            type: String,
        },
        password: {
            type: String,
        },
        role: {
            type: Schema.Types.ObjectId,
            ref: schemaNameConstants.roleSchema,
        },
        is_verified: { type: Boolean, default: false },
        is_premium: { type: Boolean, default: false },
        stripe_customer_id: { type: String },
        razorpay_customer_id: { type: String },
        deletedAt: { type: Date },

        documents: {
            aadhar_front: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            aadhar_back: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            photo: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
        },

        is_KYC_verified: {
            type: String,
            enum: ['not_submitted', 'pending', 'approved', 'rejected'],
            default: 'not_submitted',
        },
        // Add geolocation field for user's current location
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [lng, lat]
                default: [0, 0],
            },
        },
    },
    {
        timestamps: true,
    }
)

// Add 2dsphere index for geolocation
userSchema.index({ location: '2dsphere' });

export default mongoose.models?.users || mongoose.model('users', userSchema)
