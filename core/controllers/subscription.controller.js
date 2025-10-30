import planService from 'core/services/plan.service'
import subscriptionService from 'core/services/subscription.service'
import userServices from 'core/services/user.services'
import leadsServices from 'core/services/leads.services'
import paymentService from 'core/services/payment.service'
import resUtils from 'core/utils/res.utils'
const {
    createSubscription,
    createOrder,
    checkSubscriptionStatus,
    cancelSubscription,
} = require('core/utils/phonepe.utils')

const cancelUserSubscription = async (req, res, next) => {
    try {
        const user = req.user
        const { cancel_at_cycle_end, subscription_id } = req.body
        
        if (!subscription_id) {
            return resUtils.sendError(res, 400, 'subscription_id is required')
        }
        
        let options = {}
        if (cancel_at_cycle_end === 'true') {
            options.cancel_at_cycle_end = true
        }
        
        const services = { subscriptionService }
        const subscription = await cancelSubscription(subscription_id, options, services)

        await userServices.updateUserById(user.id, { isPremium: false })

        return resUtils.sendSuccess(res, 200, 'Subscription cancelled successfully')
    } catch (error) {
        console.error('Error cancelling subscription:', error)
        next(error)
    }
}
const subscribePlan = async (req, res, next) => {
    try {
        const user = req.user
        const { plan_id } = req.body
        
        if (!plan_id) {
            return resUtils.sendError(res, 400, 'plan_id is required')
        }
        
        if (!user || !user.id) {
            return resUtils.sendError(res, 400, 'User not authenticated or user ID missing')
        }
        
        const services = { planService, paymentService }
        const subscription = await createSubscription(plan_id, user.id, services)
        
        // Update user's premium status after successful subscription creation
        await userServices.updateUserById(user.id, { is_premium: true })
        
        return resUtils.sendSuccess(res, 200, 'Subscription created successfully', { subscription })
    } catch (error) {
        console.error('Error creating subscription:', error)
        next(error)
    }
}

const getAllPlans = async (req, res, next) => {
    try {
        // const { type } = req.query
        const types = await leadsServices.findCarTypes()

        // if (!types.includes(type))
        //     return resUtils.sendError(res, 400, 'Invalid parameter type ')
        const plans = await planService.listPlans()
        return resUtils.sendSuccess(
            res,
            200,
            'Plans fetched successfully',
            plans
        )
    } catch (error) {
        console.log('ERROR::', error)
        next(error)
    }
}
const getActivePlan = async (req, res, next) => {
    try {
        const user = req.user

        const activePlans = await subscriptionService.getActivePlans(user.id)

        return resUtils.sendSuccess(
            res,
            200,
            'Active plan fetched successfully',
            activePlans
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const checkStatus = async (req, res, next) => {
    try {
        const { id } = req.query
        const result = await checkSubscriptionStatus(id)
        return resUtils.sendSuccess(res, 200, 'success', result)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
export default {
    cancelUserSubscription,
    getAllPlans,
    getActivePlan,
    subscribePlan,
    checkStatus,
}
