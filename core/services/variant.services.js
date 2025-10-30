import Variant from 'core/models/variant'
import commonUtils from 'core/utils/common.utils'
import mongoose from 'mongoose'

const create = async (data) => {
    const insertBody = {
        name: data['naming.version'],
        images: [
            {
                image_url: data['naming.image_url'],
            },
        ],
        model_id: data['model_id'],
        price: {
            value: data['price'],
        },
        description: data['description'],
    }
    const res = await Variant.create(insertBody)
    // return res;
    return res
}
const exists = async (params) => {
    const { name, model_id } = params
    const isExists = await Variant.exists({ name, model_id })
    return isExists
}
const findAggregation = async (params) => {
    const { search = '', model_id, page = 1, limit = 30 } = params
    const searchRegex = commonUtils.convertToRegex(search)
    const query = [
        {
            $match: {
                model_id: new mongoose.Types.ObjectId(model_id),
                name: { $regex: searchRegex, $options: 'i' },
            },
        },
    ]
    const variantList = await Variant.aggregate([
        ...query,
        {
            $skip: parseInt(page) * parseInt(limit) - parseInt(limit),
        },
        {
            $limit: parseInt(limit),
        },
    ])
    const variantCount = await Variant.aggregate([
        ...query,
        {
            $count: 'total',
        },
    ])
    return {
        variants: variantList,
        total: variantCount[0]?.total || 0,
    }
}
const variantServices = {
    create,
    exists,
    findAggregation,
}
export default variantServices
