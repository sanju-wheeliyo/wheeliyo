import mongoose from 'mongoose'
import schemaNameConstants from 'core/constants/schemaConstants'

const notificationSchema = new mongoose.Schema(
    {
        actor: { type: mongoose.Schema.Types.ObjectId, required: false },
        notifier: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'users',
        },
        parent_id: {
            type: String,
            required: false,
        },
        parent_type: { type: String, required: true },
        entity_type: { type: String, required: true },
        read: { type: Boolean, required: true },
        isDeleted: { type: Boolean, default: false },
        meta: { type: Object },
    },
    {
        timestamps: true,
    }
)
/////
export default mongoose.models?.notification ||
    mongoose.model(schemaNameConstants.notificationSchema, notificationSchema)
