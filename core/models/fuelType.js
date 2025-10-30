import mongoose from 'mongoose'

const fuelTypeSchema = new mongoose.Schema(
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

export default mongoose.models?.fuelType ||
    mongoose.model('fuelType', fuelTypeSchema)
