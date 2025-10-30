import mongoose, { model } from 'mongoose'
import schemaNameConstants from 'core/constants/schemaConstants'
const paymentSchema = new mongoose.Schema(
    {
        plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'plans' },
        order_id: { type: String },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        payment_status: {
            type: String,
            enum: [
                'PENDING',
                'SUCCESS',
                'FAILED',
                'CANCELLED',
                'COMPLETED',
                'EXPIRED',
                'AUTHENTICATED',
            ],
        },

        amount: {
            type: Number,
        },
        amount_total: {
            type: Number,
        },
        amount_details: {
            type: Object,
        },
        currency: {
            type: String,
            required: true,
        },
        customer_id: {
            type: String,
        },
        customer_details: {
            type: Object,
        },
        payment_mode: {
            type: String,
        },
        payment_date: {
            type: Date,
        },
        razorpay_subscription_id: {
            type: String,
        },
        phonepe_merchant_id: {
            type: String,
        },
        phonepe_merchant_transaction_id: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models.payments ||
    mongoose.model(schemaNameConstants.payments, paymentSchema)
