import mongoose from 'mongoose'
import schemaNameConstants from 'core/constants/schemaConstants'

const countrySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})
export default mongoose?.models?.country ||
    mongoose.model(schemaNameConstants.countrySchema, countrySchema)
