const crypto = require('crypto')
const axios = require('axios')

/**
 * Create a PhonePe subscription for a plan
 * @param {string} plan_id - The plan ID to subscribe to
 * @param {string} user_id - The user ID creating the subscription
 * @param {Object} services - Object containing required services
 * @returns {Object} Subscription details
 */
const createSubscription = async (plan_id, user_id, services) => {
    try {
        const { planService, paymentService } = services
        
        // For PhonePe, we create a payment order that will be converted to subscription
        // when payment is successful
        const merchantTransactionId = `WHL${Date.now()}${Math.floor(Math.random() * 1000000)}`
        
        // Get plan details to calculate amount
        const planDetails = await planService.findPlanDetails(plan_id)
        
        if (!planDetails) {
            throw new Error('Plan not found')
        }

        // Create payment order for subscription
        const paymentObject = {
            plan_id: planDetails._id,
            phonepe_merchant_transaction_id: merchantTransactionId,
            amount: planDetails.amount,
            amount_total: planDetails.amount,
            currency: planDetails.currency || 'INR',
            user_id: user_id,
            payment_status: 'PENDING',
            payment_date: new Date(),
        }
        
                // Create payment record
        const payment = await paymentService.createPayment(paymentObject)

        return {
            subscription_id: merchantTransactionId,
            payment_id: payment._id,
            amount: planDetails.amount,
            currency: planDetails.currency,
            status: 'PENDING',
            plan_details: planDetails
        }
    } catch (error) {
        console.error('Error creating PhonePe subscription:', error)
        throw error
    }
}

/**
 * Create a PhonePe payment order
 * @param {Object} orderData - Order data including amount, plan_id, user_id
 * @param {Object} services - Object containing required services
 * @returns {Object} Order details
 */
const createOrder = async (orderData, services) => {
    try {
        const { amount, plan_id, user_id } = orderData
        const { planService, paymentService } = services
        
        if (!amount || !plan_id || !user_id) {
            throw new Error('Missing required fields: amount, plan_id, user_id')
        }

        const merchantTransactionId = `WHL${Date.now()}${Math.floor(Math.random() * 1000000)}`
        
        // Get plan details
        const planDetails = await planService.findPlanDetails(plan_id)
        
        if (!planDetails) {
            throw new Error('Plan not found')
        }

        // Create payment order
        const paymentObject = {
            plan_id: planDetails._id,
            phonepe_merchant_transaction_id: merchantTransactionId,
            amount: amount,
            amount_total: amount,
            currency: planDetails.currency || 'INR',
            user_id: user_id,
            payment_status: 'PENDING',
            payment_date: new Date(),
        }

        // Create payment record
        const payment = await paymentService.createPayment(paymentObject)

        return {
            order_id: merchantTransactionId,
            payment_id: payment._id,
            amount: amount,
            currency: planDetails.currency,
            status: 'PENDING',
            merchant_transaction_id: merchantTransactionId
        }
    } catch (error) {
        console.error('Error creating PhonePe order:', error)
        throw error
    }
}

/**
 * Check PhonePe subscription status
 * @param {string} subscription_id - The subscription/transaction ID to check
 * @returns {Object} Subscription status
 */
const checkSubscriptionStatus = async (subscription_id) => {
    try {
        const merchantId = process.env.PHONEPE_MERCHANT_ID || process.env.PHONEPAY_MERCHANT_ID
        const keyIndex = process.env.PHONEPE_SALT_INDEX
        const statusCheckUrl = process.env.PHONEPE_STATUS_CHECK_URL
        const saltKey = process.env.PHONEPE_SALT_KEY

        if (!merchantId || !keyIndex || !statusCheckUrl || !saltKey) {
            throw new Error('PhonePe configuration missing')
        }

        const string = `/pg/v1/status/${merchantId}/${subscription_id}${saltKey}`
        const sha256 = crypto.createHash('sha256').update(string).digest('hex')
        const checksum = sha256 + '###' + keyIndex

        const options = {
            method: 'GET',
            url: `${statusCheckUrl}/${merchantId}/${subscription_id}`,
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId,
                accept: 'application/json',
            },
        }

        const response = await axios.request(options)
        
        // Parse response and determine status
        let status = 'UNKNOWN'
        const responseData = response.data
        
        if (responseData.code === 'PAYMENT_SUCCESS' || responseData.status === 'SUCCESS') {
            status = 'SUCCESS'
        } else if (responseData.code === 'PAYMENT_ERROR' || responseData.status === 'FAILED') {
            status = 'FAILED'
        } else if (responseData.code === 'PAYMENT_PENDING' || responseData.status === 'PENDING') {
            status = 'PENDING'
        }

        return {
            subscription_id: subscription_id,
            status: status,
            response_data: responseData,
            timestamp: new Date()
        }
    } catch (error) {
        console.error('Error checking PhonePe subscription status:', error)
        throw error
    }
}

/**
 * Cancel PhonePe subscription
 * @param {string} subscription_id - The subscription ID to cancel
 * @param {Object} options - Cancellation options
 * @param {Object} services - Object containing required services
 * @returns {Object} Cancellation result
 */
const cancelSubscription = async (subscription_id, options = {}, services) => {
    try {
        const { subscriptionService } = services
        
        // For PhonePe, we need to handle subscription cancellation differently
        // Since PhonePe doesn't have recurring subscriptions like Razorpay,
        // we'll mark the subscription as cancelled in our system
        
        // Find the subscription by transaction ID
        const subscription = await subscriptionService.findSubscriptionByTxnId(subscription_id)
        
        if (!subscription) {
            throw new Error('Subscription not found')
        }

        // Update subscription status to cancelled
        const updatedSubscription = await subscriptionService.updateSubscription(
            subscription._id,
            { 
                status: 'CANCELLED',
                cancelled_at: new Date(),
                cancel_reason: options.cancel_reason || 'User cancelled'
            }
        )

        // If cancel_at_cycle_end is true, schedule cancellation for end of current cycle
        if (options.cancel_at_cycle_end) {
            // This would require additional logic to handle end-of-cycle cancellation
            // For now, we'll mark it as cancelled immediately
            console.log('End-of-cycle cancellation requested for subscription:', subscription_id)
        }

        return {
            subscription_id: subscription_id,
            status: 'CANCELLED',
            cancelled_at: new Date(),
            message: 'Subscription cancelled successfully'
        }
    } catch (error) {
        console.error('Error cancelling PhonePe subscription:', error)
        throw error
    }
}

module.exports = {
    createSubscription,
    createOrder,
    checkSubscriptionStatus,
    cancelSubscription,
} 