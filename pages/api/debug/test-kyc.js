import dbConnect from 'core/config/db.config'
import User from 'core/models/users'
import Subscription from 'core/models/subscription'
import Payments from 'core/models/payments'

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

        console.log('🔍 Testing KYC impact on data visibility for user:', user_id)

        // Get user details
        const user = await User.findById(user_id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Get all subscriptions regardless of KYC
        const allSubscriptions = await Subscription.find({ user_id: user_id })

        // Get all payments regardless of KYC
        const allPayments = await Payments.find({ user_id: user_id })

        // Get successful payments
        const successfulPayments = await Payments.find({
            user_id: user_id,
            payment_status: 'SUCCESS'
        })

        res.status(200).json({
            success: true,
            message: 'KYC test completed',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    phone: user.phone,
                    is_KYC_verified: user.is_KYC_verified,
                    is_premium: user.is_premium,
                    is_verified: user.is_verified
                },
                dataAvailability: {
                    totalSubscriptions: allSubscriptions.length,
                    totalPayments: allPayments.length,
                    successfulPayments: successfulPayments.length,
                    hasData: allSubscriptions.length > 0 || allPayments.length > 0
                },
                subscriptions: allSubscriptions.map(s => ({
                    id: s._id,
                    status: s.status,
                    plan_id: s.plan_id,
                    createdAt: s.createdAt
                })),
                payments: successfulPayments.map(p => ({
                    id: p._id,
                    payment_status: p.payment_status,
                    amount: p.amount,
                    createdAt: p.createdAt
                }))
            }
        })
    } catch (error) {
        console.error('❌ Error in KYC test:', error)
        res.status(500).json({
            success: false,
            message: 'Error in KYC test',
            error: error.message
        })
    }
}
