import mongoose from 'mongoose'
import imageSchema from './image'

const modelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        images: [imageSchema],
        make_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        popular: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models?.models || mongoose.model('models', modelSchema)
