import Make from 'core/models/make'
import { ensureConnection } from 'core/config/db.config'
import { MONGODB_URI } from 'core/constants/db.constants'
const create = async (body) => {
    const { name, images = [], popular } = body
    const res = await Make.create({
        name,
        logo_image: images.map((img) => ({ image_url: img.url })),
        popular,
    })
    return res
}
const find = async (params) => {
    const { name } = params
    const res = await Make.findOne({ name })
    return res
}

const findById = async (brand_id) => {
    const res = await Make.findOne({ _id: brand_id })
    return res
}
const fetchLast = async (params) => {
    const { paramKey = 'popular', limit = 1 } = params || {}
    const res = await Make.find()
        .sort({ [paramKey]: -1 })
        .limit(limit)
    return res
}
const listPopularBrands = async (limit = 9) => {
    try {
        await ensureConnection()
        console.log('🔍 listPopularBrands called with limit:', limit)

        // rely on ensureConnection only; do not open ad-hoc connections

        const res = await Make.find()
            .sort({ popular: 1 })
            .limit(Number(limit) || 9)
        console.log('✅ Popular brands found:', res?.length || 0)
        return res
    } catch (error) {
        console.error('❌ Error in listPopularBrands:', error)
        throw error
    }
}
const listMoreBrands = async (limit) => {
    await ensureConnection()
    const res = await Make.find()
        .sort({ popular: 1 })
        .skip(9)
        .limit(Number(limit) || 50)
    return res
}
const listAllBrands = async (skip, limit, search) => {
    try {
        await ensureConnection()
        const res = await Make.find().sort({ name: 1 })
        return res
    } catch (error) {
        console.error('❌ Error in listAllBrands:', error)
        throw error
    }
}
const changePopularIndex = async (swapOne, swapTwo) => {
    if (!swapOne || !swapTwo) return null
    const swapOneRes = await Make.findOne({ name: swapOne })
    const swapTwoRes = await Make.findOne({ name: swapTwo })
    if (!swapOneRes || !swapTwoRes) return null
    await Make.updateOne(
        { name: swapOne },
        {
            $set: {
                popular: swapTwoRes.popular,
            },
        }
    )
    await Make.updateOne(
        { name: swapTwo },
        {
            $set: {
                popular: swapOneRes.popular,
            },
        }
    )
    return { updated: true, count: 2 }
}
const makeService = {
    create,
    find,
    findById,
    listPopularBrands,
    listMoreBrands,
    fetchLast,
    listAllBrands,
    changePopularIndex,
}
export default makeService
