import mongoose from 'mongoose'
import schemaNameConstants from 'core/constants/schemaConstants'

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models?.roles ||
    mongoose.model(schemaNameConstants.roleSchema, roleSchema)
