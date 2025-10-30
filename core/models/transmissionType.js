import mongoose from 'mongoose'

const transmissionTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models?.transmissionType ||
    mongoose.model('transmissionType', transmissionTypeSchema)
