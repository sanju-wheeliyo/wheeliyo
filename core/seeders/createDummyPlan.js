import { createStripePrice } from 'core/utils/stripe.utlis'
import planService from 'core/services/plan.service'
export default async function seedDummyPlans() {
    const plan2 = {
        title: 'Testing plan',
        amount: 1000,
        currency: 'inr',
        product_name: 'Testing plan',
        features: [
            {
                value: 'View detailed vehicle history, including vehicle number',
            },
            {
                value: 'Access complete contact details of registered car owners',
            },
            {
                value: 'Customer Support',
            },
            {
                value: 'Receive real-time notifications for new leads and inquiries.',
            },
        ],
        interval: 'day',
    }
    const { product, price } = await createStripePrice(plan2)
    const interval = 'day'
    await planService.create({
        ...plan2,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        interval,
    })
}
