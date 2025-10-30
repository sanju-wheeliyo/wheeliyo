import fuelType from 'core/models/fuelType'
import { ensureConnection } from 'core/config/db.config'

const bulkInsert = async (data) => {
    const res = await fuelType.insertMany(data)
    return res
}
const getAllFuelType = async () => {
    try {
        await ensureConnection()
        return await fuelType.find()
    } catch (error) {
        console.error('❌ Get fuel types failed:', error)
        throw error
    }
}
export default { bulkInsert, getAllFuelType }
