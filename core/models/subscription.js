import mongoose from 'mongoose'
import schemaNameConstants from 'core/constants/schemaConstants'

const SubscriptionSchema = new mongoose.Schema(
    {
        stripe_subscription_id: { type: String },
        razorpay_subscription_id: { type: String },
        phonepe_merchant_transaction_id: { type: String },
        razorpay_order_id: { type: String },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        customer_id: { type: String },
        plan_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'plans',
        },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'ACTIVE', 'CANCELLED', 'FAILED', 'EXPIRED'],
            required: true,
        },
        next_billing_date: { type: Date },
        trial_end_date: { type: Date },
        payment_method: { type: String },
        cancel_at_period_end: { type: Boolean },
        cancel_at_date: { type: Date },
        canceled_at_date: { type: Date },
        renewal_count: { type: Number, default: 0 },
        expireNotificationSent: { type: Boolean },
    },
    {
        timestamps: true,
    }
)
/////
////
////
////
export default mongoose.models.subscriptions ||
    mongoose.model(schemaNameConstants.subscriptions, SubscriptionSchema)
