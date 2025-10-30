import Model from 'core/models/model'
import commonUtils from 'core/utils/common.utils'
import mongoose from 'mongoose'
const create = async (body) => {
    const { name, images = [], make_id, popular } = body
    const res = await Model.create({
        name,
        images: images.map((img) => ({ image_url: img.url })),
        make_id,
        popular,
    })
    return res
}
const find = async (params) => {
    const { name, make_id } = params
    const res = await Model.findOne({ name, make_id })
    return res
}

const findById = async (model_id) => {
    const res = await Model.findOne({ _id: model_id })
    return res
}

const fetchLast = async (params) => {
    const { paramKey = 'popular', limit = 1 } = params || {}
    const res = await Model.find()
        .sort({ [paramKey]: -1 })
        .limit(limit)
    return res
}
const findAggregation = async (params) => {
    const { make_id, page = 1, limit = 30, search = '' } = params
    const searchRegex = new RegExp(commonUtils.convertToRegex(search))
    let query = [
        {
            $match: {
                make_id: mongoose.Types.ObjectId(make_id),
                name: {
                    $regex: searchRegex,
                    $options: 'i',
                },
            },
        },
    ]
    const res = await Model.aggregate([
        ...query,
        {
            $skip: page * limit - limit,
        },
        {
            $limit: parseInt(limit),
        },
    ])
    const count = await Model.aggregate([
        ...query,
        {
            $count: 'total',
        },
    ])
    return {
        models: res,
        total: count[0]?.total || 0,
    }
}
const modelService = {
    create,
    find,
    findById,
    fetchLast,
    findAggregation,
}
export default modelService
