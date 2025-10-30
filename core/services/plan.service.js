import Plans from 'core/models/plans'
import subscription from 'core/models/subscription'
import mongoose from 'mongoose'
const create = async (data) => {
    await Plans.create(data)
}
const findPlanDetails = async (id) => {
    return await Plans.findOne({ _id: mongoose.Types.ObjectId(id) })
}
const listPlans = async (type) => {
    return await Plans.find()
}
const findActivePlansOfUser = async (userId) => {
    const pipeline = [
        {
            $match: {
                user_id: userId,
                status: 'ACTIVE',
                plan_id: { $ne: null },
            },
        },
        {
            $lookup: {
                from: 'plans',
                localField: 'plan_id',
                foreignField: '_id',
                as: 'active_plans',
            },
        },
        {
            $match: {
                active_plans: { $ne: [] },
            },
        },
        {
            $unwind: {
                path: '$active_plans',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $replaceRoot: {
                newRoot: '$active_plans',
            },
        },
        {
            $project: {
                _id: 0,
                type: 1,
            },
        },
        {
            $group: {
                _id: null,
                types: { $push: '$type' },
            },
        },

        {
            $project: {
                _id: 0,
                types: 1,
            },
        },
    ]
    const plans = await subscription.aggregate(pipeline)
    return plans
}
const findPlanByTitle = async (title) => {
    return await Plans.findOne({ title: title })
}
const updatePlanDetails = async (id, data) => {
    return await Plans.updateOne({ _id: id }, { $set: data })
}
export default {
    create,
    findPlanDetails,
    listPlans,
    findActivePlansOfUser,
    updatePlanDetails,
    findPlanByTitle,
}
