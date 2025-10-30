import dbConnect from 'core/config/db.config'
import Payments from 'core/models/payments'
import Subscription from 'core/models/subscription'
import User from 'core/models/users'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        await dbConnect()
        console.log('🔍 Checking database for payments, subscriptions, and users...')

        // Check payments
        const payments = await Payments.find({}).limit(5).sort({ createdAt: -1 })
        const totalPayments = await Payments.countDocuments()

        // Check subscriptions
        const subscriptions = await Subscription.find({}).limit(5).sort({ createdAt: -1 })
        const totalSubscriptions = await Subscription.countDocuments()

        // Check users with premium status
        const premiumUsers = await User.find({ is_premium: true }).limit(5)
        const totalPremiumUsers = await User.countDocuments({ is_premium: true })

        // Check all users
        const totalUsers = await User.countDocuments()

        res.status(200).json({
            success: true,
            message: 'Database check completed',
            data: {
                payments: {
                    total: totalPayments,
                    recent: payments.map(p => ({
                        id: p._id,
                        user_id: p.user_id,
                        plan_id: p.plan_id,
                        payment_status: p.payment_status,
                        amount: p.amount,
                        createdAt: p.createdAt
                    }))
                },
                subscriptions: {
                    total: totalSubscriptions,
                    recent: subscriptions.map(s => ({
                        id: s._id,
                        user_id: s.user_id,
                        plan_id: s.plan_id,
                        status: s.status,
                        start_date: s.start_date,
                        end_date: s.end_date,
                        createdAt: s.createdAt
                    }))
                },
                users: {
                    total: totalUsers,
                    premium: totalPremiumUsers,
                    recentPremium: premiumUsers.map(u => ({
                        id: u._id,
                        name: u.name,
                        phone: u.phone,
                        is_premium: u.is_premium,
                        createdAt: u.createdAt
                    }))
                }
            }
        })
    } catch (error) {
        console.error('❌ Error checking database:', error)
        res.status(500).json({
            success: false,
            message: 'Error checking database',
            error: error.message
        })
    }
}
