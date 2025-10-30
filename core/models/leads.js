import mongoose from 'mongoose'

const leadsSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            // required: true,
        },
        owner: {
            name: { type: String, required: true },
            contact: { type: String, required: true },
        },
        vehicle: {
            number: { type: String },
            brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'makes' },
            variant_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'variants',
            },
            model_id: { type: mongoose.Schema.Types.ObjectId, ref: 'models' },
            year_of_manufacture: { type: String },
            registered_state: { type: String },
            min_kilometers: { type: Number },
            max_kilometers: { type: Number },
            image: { type: String },
            price: { type: Number },
            location: { type: String },
            owner_count: {
                type: Number,
                min: 1,
                default: 1,
            },
            notes: { type: String },
        },
        documents: {
            rc: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            puc: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            insurance: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_front: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_back: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_left: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_right: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_interior_front: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_interior_back: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_frontside_left: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_frontside_right: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_backside_right: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            car_backside_left: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            odometer: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
            service_history: {
                s3Key: String,
                contentType: String,
                originalName: String,
                status: {
                    type: String,
                    enum: ['pending', 'verifying', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: String,
            },
        },
        auction_details: {
            bank_name: { type: String },
            start_date: { type: Date },
            end_date: { type: Date },
            location: { type: String },
            emd_amount: { type: Number },
            emd_date: { type: Date },
            reserve_price: { type: String },
            inspection_date: { type: Date },
            borrower_details: { type: String },
        },
        car_type: {
            type: String,
            default: 'pre-owned',
            enum: ['pre-owned', 'auction'],
            required: true,
        },
        liked_users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
            },
        ],
        approved: {
            type: Boolean,
            default: false,
        },
        leadApprovalStatus: {
            type: String,
            enum: ['pending', 'rejected', 'approved'],
            default: 'pending',
        },
        approvedAt: {
            type: Date,
        },
        allDocsApproved: {
            type: Boolean,
            default: false,
        },
        documentStatus: {
            type: String,
            enum: ['pending', 'verifying', 'approved', 'rejected'],
            default: 'pending',
        },
        leadStatus: {
            type: String,
            enum: ['active', 'sold', 'withdrawn', 'expired'],
            default: 'active',
        },
        soldAt: {
            type: Date,
        },
        image_key: {
            type: String,
        },
        image_keys: [String],
        fuel_type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'fuelType',
        },
        transmission_type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'transmissionType',
        },
        coordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
    },
    {
        timestamps: true,
    }
)
leadsSchema.index({ coordinates: '2dsphere' })

// Add indexes for better query performance
// Note: No unique index on vehicle.number - uniqueness is enforced at application level
// with leadStatus filtering (see leads.controller.js createLeads function)
leadsSchema.index({ 'vehicle.number': 1 }, { sparse: true }) // Index for vehicle number queries
leadsSchema.index({ 'vehicle.price': 1 })
leadsSchema.index({ approved: 1, 'vehicle.price': 1 }) // Compound index for common queries
leadsSchema.index({ car_type: 1, approved: 1, 'vehicle.price': 1 }) // Compound index for filtered queries
leadsSchema.index({ 'vehicle.owner_count': 1 }) // Index for owner count queries
leadsSchema.index({ approved: 1, 'vehicle.owner_count': 1 }) // Compound index for owner count queries
leadsSchema.index({ leadStatus: 1 }) // Index for lead status queries
leadsSchema.index({ approved: 1, leadStatus: 1 }) // Compound index for approved and status queries
leadsSchema.index({ leadApprovalStatus: 1 }) // Index for lead approval status queries
leadsSchema.index({ approved: 1, leadApprovalStatus: 1 }) // Compound index for approved and approval status queries
export default mongoose.models.Leads || mongoose.model('Leads', leadsSchema)
