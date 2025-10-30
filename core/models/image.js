import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema(
    {
        image_url: {
            type: String,
            // required: true,
        },
    },
    {
        timestamps: true,
    }
)

export default imageSchema
