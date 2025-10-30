import mongoose from 'mongoose'
import imageSchema from './image'

const makeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        logo_image: [imageSchema],
        popular: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models?.makes || mongoose.model('makes', makeSchema)
