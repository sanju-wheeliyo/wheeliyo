import transmissionType from 'core/models/transmissionType'
import { ensureConnection } from 'core/config/db.config'

const bulkInsert = async (data) => {
    const res = await transmissionType.insertMany(data)
    return res
}
const getAllTransmissionTypes = async () => {
    try {
        await ensureConnection()
        return await transmissionType.find()
    } catch (error) {
        console.error('❌ Get transmission types failed:', error)
        throw error
    }
}
export default { bulkInsert, getAllTransmissionTypes }
