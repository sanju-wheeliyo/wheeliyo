import mongoose, { Schema, model } from 'mongoose'
import schemaNamesConstants from 'core/constants/schemaConstants'

const dbSeederSchema = new Schema(
    {
        seeder_name: {
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
export default mongoose.models?.db_seeders ||
    mongoose.model(schemaNamesConstants.dbSeeder, dbSeederSchema)
