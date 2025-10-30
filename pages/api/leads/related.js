import dbConnect from 'core/config/db.config'
import Variant from 'core/models/variant'
import Lead from 'core/models/leads'
import resUtils from 'core/utils/res.utils'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { carId } = req.query
    if (!carId) {
        return res.status(400).json({ message: 'Missing carId parameter' })
    }

    await dbConnect()

    // Find the variant and its model_id
    const variant = await Variant.findById(carId)
    if (!variant) {
        return res.status(404).json({ message: 'Car (variant) not found' })
    }

    // To get brand_id, we need to get the model and then the make (brand)
    const Model = (await import('core/models/model')).default
    const model = await Model.findById(variant.model_id)
    if (!model) {
        return res
            .status(404)
            .json({ message: 'Model not found for this variant' })
    }

    const brandId = model.make_id
    if (!brandId) {
        return res
            .status(404)
            .json({ message: 'Brand (make) not found for this model' })
    }

    // Find all leads for cars of the same brand
    const leads = await Lead.find({ 
        'vehicle.brand_id': brandId,
        'vehicle.variant_id': { $ne: carId }
    })

    return resUtils.sendSuccess(res, 200, 'Related leads fetched', { leads })
}
