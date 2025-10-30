import dbConnect from 'core/config/db.config'
import Payments from 'core/models/payments'
import Subscription from 'core/models/subscription'
import User from 'core/models/users'
import Plan from 'core/models/plans'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        await dbConnect()
        const { user_id } = req.query

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing user_id parameter'
            })
        }

        console.log('🔍 Checking comprehensive user data for:', user_id)

        // Get user details
        const user = await User.findById(user_id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Get all payments for this user
        const payments = await Payments.find({ user_id: user_id }).sort({ createdAt: -1 })

        // Get all subscriptions for this user
        const subscriptions = await Subscription.find({ user_id: user_id }).sort({ createdAt: -1 })

        // Get active subscription
        const activeSubscription = await Subscription.findOne({
            user_id: user_id,
            status: 'ACTIVE'
        }).populate('plan_id')

        // Get plan details for payments
        const planIds = [...new Set(payments.map(p => p.plan_id))]
        const plans = await Plan.find({ _id: { $in: planIds } })

        // Check for data inconsistencies
        const issues = []

        // Check if user has payments but no subscriptions
        if (payments.length > 0 && subscriptions.length === 0) {
            issues.push('User has payments but no subscriptions created')
        }

        // Check if user has subscriptions but no active ones
        if (subscriptions.length > 0 && !activeSubscription) {
            issues.push('User has subscriptions but none are active')
        }

        // Check if user is premium but no active subscription
        if (user.is_premium && !activeSubscription) {
            issues.push('User marked as premium but no active subscription found')
        }

        // Check payment statuses
        const successfulPayments = payments.filter(p => p.payment_status === 'SUCCESS')
        if (successfulPayments.length > 0 && subscriptions.length === 0) {
            issues.push('User has successful payments but no subscriptions created')
        }

        res.status(200).json({
            success: true,
            message: 'User data check completed',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    is_premium: user.is_premium,
                    is_verified: user.is_verified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                payments: {
                    total: payments.length,
                    successful: successfulPayments.length,
                    details: payments.map(p => ({
                        id: p._id,
                        plan_id: p.plan_id,
                        payment_status: p.payment_status,
                        amount: p.amount,
                        phonepe_merchant_transaction_id: p.phonepe_merchant_transaction_id,
                        phonepe_merchant_id: p.phonepe_merchant_id,
                        createdAt: p.createdAt
                    }))
                },
                subscriptions: {
                    total: subscriptions.length,
                    active: activeSubscription ? 1 : 0,
                    details: subscriptions.map(s => ({
                        id: s._id,
                        plan_id: s.plan_id,
                        status: s.status,
                        start_date: s.start_date,
                        end_date: s.end_date,
                        phonepe_merchant_transaction_id: s.phonepe_merchant_transaction_id,
                        createdAt: s.createdAt
                    }))
                },
                plans: plans.map(p => ({
                    id: p._id,
                    title: p.title,
                    amount: p.amount,
                    interval: p.interval
                })),
                activeSubscription: activeSubscription ? {
                    id: activeSubscription._id,
                    plan: activeSubscription.plan_id,
                    status: activeSubscription.status,
                    start_date: activeSubscription.start_date,
                    end_date: activeSubscription.end_date
                } : null,
                issues: issues,
                summary: {
                    hasPayments: payments.length > 0,
                    hasSubscriptions: subscriptions.length > 0,
                    hasActiveSubscription: !!activeSubscription,
                    isPremium: user.is_premium,
                    dataConsistent: issues.length === 0
                }
            }
        })
    } catch (error) {
        console.error('❌ Error checking user data:', error)
        res.status(500).json({
            success: false,
            message: 'Error checking user data',
            error: error.message
        })
    }
}
