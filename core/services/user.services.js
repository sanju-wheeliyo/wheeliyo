import Role from '../models/roles'
import User from '../models/users'
import mongoose from 'mongoose'
const createUser = async (data) => {
    const user = await User.create(data)
    return user
}
const getUserByEmailOrPhone = async (email, phone) => {
    const user = await User.findOne({
        $or: [{ email: email }, { phone: phone }],
    })
        .populate('role')
        .exec()

    return user?.toJSON()
}
export const verifyUser = async (user) => {
    const updatedUser = await User.findOneAndUpdate(
        { _id: user?._id },
        {
            is_verified: true,
        }
    )

    return updatedUser
}
const getUserByEmail = async (email) => {
    const user = await User.findOne({ email: email, deletedAt: null }).populate(
        'role'
    )
    return user ? user?.toJSON() : null
}
const getSanitizedUserData = async (id) => {
    const user = await User.findOne({ _id: id })
        .populate('role')
        .select('-password -stripe_customer_id ')

    return user?.toJSON()
}
const getUserByPhone = async (value) => {
    const user = await User.findOne({ phone: value }).populate('role')
    return user
}
const changePassword = async (id, password) => {
    const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        {
            password: password,
        }
    )
    return updatedUser
}
const updateUserById = async (id, data) => {
    const updatedUser = await User.findOneAndUpdate({ _id: id }, { $set: data }, { new: true })
    return updatedUser
}
const getUserById = async (id) => {
    const result = await User.findOne({ _id: id })
    return result
}
const getAllUsers = async (is_premium, search, page, limit, adminId) => {
    const pipeline = []
    if (is_premium) {
        pipeline.push({
            $lookup: {
                from: 'subscriptions',
                let: { userId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$user_id', '$$userId'] },
                                    { $in: ['$status', ['ACTIVE', 'active']] },
                                ],
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: 'plans',
                            localField: 'plan_id',
                            foreignField: '_id',
                            as: 'plan_details',
                        },
                    },
                    {
                        $unwind: {
                            path: '$plan_details',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                ],
                as: 'activeSubscriptions',
            },
        })
        pipeline.push({
            $match: {
                'activeSubscriptions.0': { $exists: true },
                is_premium: true,
            },
        })
    }
    if (search) {
        const searchRegex = new RegExp(search, 'i')
        pipeline.push({ $match: { name: searchRegex } })
    }

    pipeline.push({
        $match: {
            role: { $ne: mongoose.Types.ObjectId(adminId) },
            deletedAt: null,
        },
    })
    pipeline.push({ $sort: { createdAt: -1 } })
    // Explicit projection for admin KYC view
    pipeline.push({
        $project: {
            name: 1,
            email: 1,
            phone: 1,
            country_code: 1,
            city: 1,
            is_verified: 1,
            is_premium: 1,
            is_KYC_verified: 1,
            documents: 1,
            createdAt: 1,
            updatedAt: 1,
            activeSubscriptions: 1,
        }
    })
    const result = await User.aggregate([
        ...pipeline,
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ])
    
    const count = await User.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ])
    return {
        data: result,
        count: count[0]?.total,
    }
}
const findRoleNotifiers = async (role_id) => {
    return await User.find({ role: role_id })
}
const getDealers = async () => {
    const pipeline = [
        {
            $match: {
                is_premium: { $ne: true },
            },
        },
        {
            $project: {
                name: 1,
                phone: 1,
                _id: 0,
            },
        },
    ]
    const result = User.aggregate(pipeline)
    return result
}

// New function to check phone number uniqueness across ALL users (including deleted ones)
const checkPhoneNumberUniqueness = async (phone) => {
    const existingUser = await User.findOne({ phone })
    return existingUser
}

// HARD DELETE: Completely remove user and all associated data
const hardDeleteUser = async (userId) => {
    try {
        // 1. Get user details before deletion for cleanup
        const user = await User.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        // 2. Get all leads associated with this user
        const Leads = (await import('core/models/leads')).default
        const userLeads = await Leads.find({ user_id: userId })
        
        // 3. Delete all S3 files (user docs + lead images)
        const { deleteS3Object } = await import('core/utils/storage.utils')
        
        // Delete user documents from S3
        if (user.documents) {
            const userDocTypes = ['aadhar_front', 'aadhar_back', 'photo']
            for (const docType of userDocTypes) {
                if (user.documents[docType]?.s3Key) {
                    try {
                        await deleteS3Object(user.documents[docType].s3Key)
                        console.log(`✅ Deleted user doc from S3: ${docType}`)
                    } catch (deleteErr) {
                        console.error(`⚠️ Failed to delete user doc from S3: ${docType}`, deleteErr)
                    }
                }
            }
        }

        // Delete lead images from S3
        for (const lead of userLeads) {
            if (lead.documents) {
                const leadDocTypes = [
                    'rc', 'puc', 'insurance', 'car_front', 'car_back', 'car_left', 'car_right',
                    'car_interior_front', 'car_frontside_left', 'car_frontside_right',
                    'car_backside_right', 'car_backside_left', 'car_interior_back',
                    'odometer', 'service_history'
                ]
                
                for (const docType of leadDocTypes) {
                    if (lead.documents[docType]?.s3Key) {
                        try {
                            await deleteS3Object(lead.documents[docType].s3Key)
                            console.log(`✅ Deleted lead doc from S3: ${docType} for lead ${lead._id}`)
                } catch (deleteErr) {
                            console.error(`⚠️ Failed to delete lead doc from S3: ${docType} for lead ${lead._id}`, deleteErr)
                        }
                    }
                }
            }
            
            // Delete lead image if exists
            if (lead.image_key) {
                try {
                    await deleteS3Object(lead.image_key)
                    console.log(`✅ Deleted lead image from S3: ${lead.image_key}`)
                } catch (deleteErr) {
                    console.error(`⚠️ Failed to delete lead image from S3: ${lead.image_key}`, deleteErr)
                }
            }
        }

        // 4. Delete all leads from database
        if (userLeads.length > 0) {
            await Leads.deleteMany({ user_id: userId })
            console.log(`✅ Deleted ${userLeads.length} leads from database`)
        }

        // 5. Delete user from database
        await User.findByIdAndDelete(userId)
        console.log(`✅ Deleted user ${userId} from database`)

        return {
            success: true,
            deletedUser: user,
            deletedLeads: userLeads.length,
            message: `Successfully deleted user and ${userLeads.length} associated leads`
        }

    } catch (error) {
        console.error('Hard delete user error:', error)
        throw error
    }
}

const checkUser = async (data) => {
    return await User.findOne(data)
}

const getDealersNumberAndNames = async () => {
    const pipeline = [
        {
            $match: {
                is_premium: true,
                deletedAt: null,
            },
        },
        {
            $project: {
                name: 1,
                phone: 1,
                _id: 0,
            },
        },
    ]
    const result = await User.aggregate(pipeline)
    return result
}

const getAllUsersPhoneNumbers = async () => {
    try {
        const numbers = await User.find(
            {
                phone: {
                    $exists: true,
                },
            },
            { phone: 1, _id: 0, country_code: 1 }
        )
        return [numbers[0]]
    } catch (error) {
        console.log('getAllUsersPhoneNumbers ERROR===>', error)
    }
}

const updateUserByPhone = async (phone, update) => {
    return await User.findOneAndUpdate({ phone }, { $set: update }, { new: true })
}

export default {
    createUser,
    getUserByEmailOrPhone,
    verifyUser,
    getUserByEmail,
    getUserByPhone,
    changePassword,
    updateUserById,
    getSanitizedUserData,
    getUserById,
    getAllUsers,
    findRoleNotifiers,
    getDealers,
    hardDeleteUser,
    checkPhoneNumberUniqueness,
    checkUser,
    getDealersNumberAndNames,
    getAllUsersPhoneNumbers,
    updateUserByPhone,
}
