import Razorpay from 'razorpay'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export const createCustomer = async (userData) => {
    try {
        const customer = await razorpay.customers.create(userData)
        return customer
    } catch (error) {
        console.log(error, 'error')
    }
}

export const createPlan = async (data) => {
    try {
        const plan = razorpay.plans.create({
            period: data.period,
            interval: data.interval,
            item: {
                name: data.title,
                amount: data.amount * 100,
                currency: 'INR',
                description: data.description,
            },
        })
        return plan
    } catch (error) {
        console.log(error, 'error')
    }
}
export const createSubscription = async (plan_id) => {
    const subscribe = await razorpay.subscriptions.create({
        plan_id: plan_id,
        customer_notify: 1,
        quantity: 1,
        total_count: 100,
        quantity: 1,
    })
    return subscribe
}
export const createOrder = async (options) => {
    const order = await razorpay.orders.create(options)
    return order
}
export const checkSubscriptionStatus = async (sub_id) => {
    const status = await razorpay.subscriptions.fetch(sub_id)
    return status
}
export const cancelSubscription = async (subscriptionId, options) => {
    const status = await razorpay.subscriptions.cancel(subscriptionId, options)
    return status
}
