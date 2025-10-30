import mongoose from 'mongoose'

const logsSchema = new mongoose.Schema(
    {
        event_type: String,
        id: String,
        type: String,
        billing_reason: String,
        customer_id: String,
        meta: Object,
    },
    {
        timestamps: true,
    }
)
export default mongoose.models.logs || mongoose.model('logs', logsSchema)
