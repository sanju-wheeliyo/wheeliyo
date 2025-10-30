import Payments from 'core/models/payments'
import mongoose from 'mongoose'
const createPayment = async (data) => {
    return await Payments.create(data)
}
const findOne = async (id) => {
    try {
        // Convert string ID to ObjectId if it's a valid ObjectId string
        if (id && mongoose.Types.ObjectId.isValid(id)) {
            return await Payments.findOne({
                _id: new mongoose.Types.ObjectId(id),
            })
        } else {
            console.log('❌ Invalid ObjectId format:', id)
            return null
        }
    } catch (error) {
        console.error('❌ Error in findOne:', error)
        return null
    }
}
const updatePaymentById = async (id, data) => {
    return await Payments.updateOne({ stripe_payment_id: id }, data)
}
const getPaymentByUserId = async (userId, page = 1, limit = 10) => {
    const pipeline = []

    const skip = (page - 1) * limit
    pipeline.push(
        {
            $match: {
                user_id: new mongoose.Types.ObjectId(userId),
                payment_status: 'SUCCESS',
            },
        },
        {
            $lookup: {
                from: 'plans',
                localField: 'plan_id',
                foreignField: '_id',
                as: 'plan',
            },
        },
        {
            $sort: {
                updatedAt: -1,
            },
        }
    )

    const payments = await Payments.aggregate([
        ...pipeline,
        {
            $skip: skip,
        },
        {
            $limit: parseInt(limit),
        },
    ])
    const count = await Payments.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ])

    return {
        data: payments,
        count: count[0]?.total,
    }
}
const getAllpayments = async (page = 1, limit = 10, search) => {
    const skip = (page - 1) * limit
    const regexPattern = new RegExp(`^${search}`, 'i')
    const pipeline = [
        {
            $match: {
                payment_status: 'SUCCESS',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $unwind: '$user',
        },
        {
            $match: {
                'user.deletedAt': null,
            },
        },
        {
            $sort: {
                updatedAt: -1,
            },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
    ]
    if (search) {
        pipeline.push({
            $match: {
                'user.name': regexPattern,
            },
        })
    } else {
        pipeline.push({
            $sort: { updatedAt: -1 },
        })
    }

    const invoices = await Payments.aggregate(pipeline)
    const count = await Payments.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ])
    return {
        data: invoices,
        count: count[0]?.total,
    }
}

const findPayment = async (id) => {
    return await Payments.findOne({ razorpay_subscription_id: id })
}
const updatePaymentByOrderId = async (order_id, data) => {
    return await Payments.updateOne({ order_id: order_id }, data)
}
const findPaymentByOrderId = async (id) => {
    return await Payments.findOne({ order_id: id })
}

const findPaymentByUserAndPlan = async (userId, planId) => {
    console.log('🔍 Searching for payment:', { userId, planId })

    // First try to find by user_id and plan_id with SUCCESS status
    let payment = await Payments.findOne({
        user_id: userId,
        plan_id: planId,
        payment_status: 'SUCCESS',
    }).sort({ createdAt: -1 })

    // If no SUCCESS payment found, try to find any payment for this user and plan
    if (!payment) {
        payment = await Payments.findOne({
            user_id: userId,
            plan_id: planId,
        }).sort({ createdAt: -1 })

        if (payment) {
            console.log('🔍 Found payment but status is not SUCCESS:', {
                paymentId: payment._id,
                status: payment.payment_status,
                phonepeTxnId: payment?.phonepe_merchant_transaction_id,
                razorpayOrderId: payment?.razorpay_order_id,
            })
        }
    }

    console.log('🔍 Payment search result:', {
        found: !!payment,
        paymentId: payment?._id,
        paymentStatus: payment?.payment_status,
        createdAt: payment?.createdAt,
        phonepeTxnId: payment?.phonepe_merchant_transaction_id,
        razorpayOrderId: payment?.razorpay_order_id,
    })

    // If no payment found, let's also check what payments exist for this user
    if (!payment) {
        console.log(
            '🔍 No payment found, checking all payments for user:',
            userId
        )
        const allUserPayments = await Payments.find({ user_id: userId }).sort({
            createdAt: -1,
        })
        console.log(
            '🔍 All user payments:',
            allUserPayments.map((p) => ({
                id: p._id,
                planId: p.plan_id,
                status: p.payment_status,
                phonepeTxnId: p.phonepe_merchant_transaction_id,
                razorpayOrderId: p.razorpay_order_id,
                createdAt: p.createdAt,
            }))
        )
    }

    return payment
}

const findPaymentByPhonePeTxnId = async (transactionId) => {
    return await Payments.findOne({
        phonepe_merchant_transaction_id: transactionId,
        payment_status: 'SUCCESS',
    })
}

export default {
    createPayment,
    findOne,
    updatePaymentById,
    getPaymentByUserId,
    getAllpayments,
    findPayment,
    updatePaymentByOrderId,
    findPaymentByOrderId,
    findPaymentByUserAndPlan,
    findPaymentByPhonePeTxnId,
}
