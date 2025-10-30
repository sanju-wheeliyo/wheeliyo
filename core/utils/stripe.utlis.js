import { STRIPE_SECRET_KEY } from 'core/constants/env.constants'
import resUtils from './res.utils'

const stripe = require('stripe')(STRIPE_SECRET_KEY)

export const createStripePrice = async ({
    amount,
    currency,
    product_name,
    interval,
}) => {
    const product = await stripe.products.create({
        name: product_name,
    })
    const price = await stripe.prices.create({
        unit_amount: amount * 100,
        currency: currency,
        recurring: {
            interval: interval,
        },
        product: product.id,
    })
    return { product, price }
}

export const createStripeCheckoutSession = async (
    priceId,
    customerId,
    returnUrl
) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer: customerId,
            billing_address_collection: 'required',
            mode: 'subscription',
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl}?success=false`,
        })

        return session
    } catch (error) {
        console.log(error)
    }
}
export const createCustomer = async (userData) => {
    try {
        const customer = await stripe.customers.create(userData)

        return customer
    } catch (error) {
        console.log(error)
    }
}
export const retrieveSessionStatus = async (session_id) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id)

        return session
    } catch (error) {}
}
export const listStripeCheckoutStatus = async (checkout_id) => {
    const session = await stripeConfig.checkout.sessions.listLineItems(
        checkout_id
    )
    return session
}
