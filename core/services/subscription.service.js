import Subscription from 'core/models/subscription'

const createSubscription = async (data) => {
    return await Subscription.create(data)
}
const updateSubscription = async (id, data) => {
    return await Subscription.updateOne({ _id: id }, data)
}

const updateSubscriptionByStripeId = async (id, data) => {
    return await Subscription.updateOne({ stripe_subscription_id: id }, data)
}
const findOne = async (id) => {
    const result = await Subscription.findOne({ stripe_subscription_id: id })
    return result
}
const getActivePlan = async (id) => {
    const res = await Subscription.findOne({
        user_id: id,
        status: 'ACTIVE',
    }).populate('plan_id')
    return res
}

const getActivePlans = async (id) => {
    const res = await Subscription.find({
        user_id: id,
        status: 'ACTIVE',
    })
        .populate('plan_id')
        .sort({ createdAt: -1 })
    return res
}
const renewSubscription = async (invoiceData) => {
    const subscription_id = invoiceData.lines.data[0].subscription
    const subscription = await findOne(subscription_id)
    const periodStart = invoiceData.lines.data[0].period.start
    const periodEnd = invoiceData.lines.data[0].period.end
    const createdDate = new Date(periodStart * 1000)
    const expiresAt = new Date(periodEnd * 1000)
    const updateData = {
        start_date: createdDate,
        end_date: expiresAt,
        renewal_count: subscription.renewal_count + 1,
    }
    const updated = await updateSubscription(subscription._id, updateData)
    return updateData
}
const stopSubscription = async (invoice) => {
    const subscription_id = invoice.lines.data[0].subscription
    const subscriptionDetails = findOne(subscription_id)
    updateSubscription(subscriptionDetails._id, {
        status: 'INACTIVE',
        cancel_at_date: data.canceled_at,
        canceled_at_date: data.canceled_at,
    })

    const subscription = await findOne(data.id)
    await userServices.updateUserById(subscription.user_id, {
        isPremium: false,
    })
    return true
}
const handleCancelSubscription = async (data) => {
    updateSubscription(data.id, {
        status: 'INACTIVE',
        cancel_at_date: data.canceled_at,
        canceled_at_date: data.canceled_at,
    })

    const subscription = findOne(data.id)
    await userServices.updateUserById(subscription.user_id, {
        isPremium: false,
    })
    return true
}
const findSubscriptionByTxnId = async (id) => {
    return await Subscription.findOne({
        $or: [
            { phonepe_merchant_transaction_id: id },
            { razorpay_order_id: id },
        ],
    })
}
const updateSubscriptionByOrderId = async (id) => {
    return await Subscription.updateOne({ order_id: id }, data)
}
export default {
    createSubscription,
    updateSubscription,
    updateSubscriptionByStripeId,
    findOne,
    getActivePlan,
    getActivePlans,
    renewSubscription,
    stopSubscription,
    handleCancelSubscription,
    findSubscriptionByTxnId,
    updateSubscriptionByOrderId,
}
