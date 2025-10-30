import mongoose from 'mongoose'

const plansSchema = new mongoose.Schema(
    {
        title: { type: String },
        features: { type: Array },
        stripe_product_id: { type: String },
        stripe_price_id: { type: String },
        amount: { type: Number },
        currency: { type: String },
        priority: { type: Number },
        interval: { type: Number },
        razorpay_plan_id: { type: String },
        type: { type: String },
        period: { type: String },
        priority: { type: Number },
    },
    {
        timestamps: true,
    }
)
export default mongoose.models.plans || mongoose.model('plans', plansSchema)
