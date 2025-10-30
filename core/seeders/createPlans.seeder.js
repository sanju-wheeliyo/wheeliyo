import PlanService from 'core/services/plan.service'
import { createPlan } from 'core/utils/razorpay.utils'
// const auctionPlans = [
//     {
//         title: '3 months Dealer plan',
//         period: 'monthly',
//         interval: 3,
//         amount: 3999,
//         currency: 'INR',
//         features: [
//             {
//                 value: 'View detailed vehicle history, including vehicle number Notifications',
//             },
//             {
//                 value: 'Access complete contact details of registered car owners Notifications',
//             },
//             {
//                 value: 'Customer Support',
//             },
//             {
//                 value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
//             },
//             {
//                 value: 'Access to Bank Auction Cars across India',
//             },
//         ],
//         description: '',
//         type: 'auction',
//     },
//     {
//         title: '6 months Dealer plan',
//         period: 'monthly',
//         interval: 6,
//         amount: 5999,
//         currency: 'INR',
//         features: [
//             {
//                 value: 'View detailed vehicle history, including vehicle number Notifications',
//             },
//             {
//                 value: 'Access complete contact details of registered car owners Notifications',
//             },
//             {
//                 value: 'Customer Support',
//             },
//             {
//                 value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
//             },
//             {
//                 value: 'Access to Bank Auction Cars across India',
//             },
//         ],
//         description: '',
//         type: 'auction',
//     },
//     {
//         title: '12 months Dealer plan',
//         period: 'monthly',
//         interval: 12,
//         amount: 9999,
//         currency: 'INR',
//         features: [
//             {
//                 value: 'View detailed vehicle history, including vehicle number Notifications',
//             },
//             {
//                 value: 'Access complete contact details of registered car owners Notifications',
//             },
//             {
//                 value: 'Customer Support',
//             },
//             {
//                 value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
//             },
//             {
//                 value: 'Access to Bank Auction Cars across India',
//             },
//         ],
//         description: '',
//         type: 'auction',
//     },
// ]
// const preownedPlans = [
//     {
//         title: '3 months Dealer plan',
//         period: 'monthly',
//         interval: 3,
//         amount: 4999,
//         currency: 'INR',
//         features: [
//             {
//                 value: 'View detailed vehicle history, including vehicle number Notifications',
//             },
//             {
//                 value: 'Access complete contact details of registered car owners Notifications',
//             },
//             {
//                 value: 'Customer Support',
//             },
//             {
//                 value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
//             },
//         ],
//         description: '',
//         type: 'pre-owned',
//     },
//     {
//         title: '6 months Dealer plan',
//         period: 'monthly',
//         interval: 6,
//         amount: 6999,
//         currency: 'INR',
//         features: [
//             {
//                 value: 'View detailed vehicle history, including vehicle number Notifications',
//             },
//             {
//                 value: 'Access complete contact details of registered car owners Notifications',
//             },
//             {
//                 value: 'Customer Support',
//             },
//             {
//                 value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
//             },
//         ],
//         description: '',
//         type: 'pre-owned',
//     },
//     {
//         title: '12 months Dealer plan',
//         period: 'monthly',
//         interval: 12,
//         amount: 10999,
//         currency: 'INR',
//         features: [
//             {
//                 value: 'View detailed vehicle history, including vehicle number Notifications',
//             },
//             {
//                 value: 'Access complete contact details of registered car owners Notifications',
//             },
//             {
//                 value: 'Customer Support',
//             },
//             {
//                 value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
//             },
//         ],
//         description: '',
//         type: 'pre-owned',
//     },
// ]
// const plans = [...auctionPlans, ...preownedPlans]

const consolidatedPlans = [
    {
        title: '3 months Dealer plan',
        period: 'monthly',
        interval: 3,
        amount: 4999,
        currency: 'INR',
        features: [
            {
                value: 'View detailed vehicle history, including vehicle number Notifications',
            },
            {
                value: 'Access complete contact details of registered car owners Notifications',
            },
            {
                value: 'Customer Support',
            },
            {
                value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
            },
            {
                value: 'Access to Bank Auction Cars across India',
            },
        ],
        description: '',
    },
    {
        title: '6 months Dealer plan',
        period: 'monthly',
        interval: 6,
        amount: 7999,
        currency: 'INR',
        features: [
            {
                value: 'View detailed vehicle history, including vehicle number Notifications',
            },
            {
                value: 'Access complete contact details of registered car owners Notifications',
            },
            {
                value: 'Customer Support',
            },
            {
                value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
            },
            {
                value: 'Access to Bank Auction Cars across India',
            },
        ],
        description: '',
    },
    {
        title: '12 months Dealer plan',
        period: 'monthly',
        interval: 12,
        amount: 10999,
        currency: 'INR',
        features: [
            {
                value: 'View detailed vehicle history, including vehicle number Notifications',
            },
            {
                value: 'Access complete contact details of registered car owners Notifications',
            },
            {
                value: 'Customer Support',
            },
            {
                value: 'Receive real-time notifications for new leads and inquiries through mail, WhatsApp',
            },
            {
                value: 'Access to Bank Auction Cars across India',
            },
        ],
        description: '',
    },
]
//
export default async function createPlans() {
    try {
        const planCreatedPromises = consolidatedPlans.map(async (plan) => {
            try {
                const planCreated = await createPlan(plan)
                const data = {
                    title: plan.title,
                    features: plan.features,
                    amount: plan.amount,
                    currency: plan.currency,
                    interval: plan.interval,
                    razorpay_plan_id: planCreated?.id,
                    // type: plan.type,
                }
                await PlanService.create(data)
            } catch (error) {
                console.error(`Error creating plan ${plan.title}:`, error)
            }
        })
        await Promise.all(planCreatedPromises)
        console.log('plans created successfully')
    } catch (error) {
        console.log(error)
    }
}
