import adminController from '../../../core/controllers/admin.controller'
import resUtils from '../../../core/utils/res.utils'
import handler from '../../../core/config/nextConnect.config'
import { authenticateTokenMiddleware } from '../../../core/middleware/auth.middleware'
import { authenticateAdminMiddleware } from '../../../core/middleware/admin.middleware'

const apiHandler = handler()

apiHandler.get(
    authenticateTokenMiddleware,
    authenticateAdminMiddleware,
    async (req, res) => {
        try {
            const User = (await import('../../../core/models/users')).default
            const Subscription = (await import('../../../core/models/subscription')).default
            
            // Get all premium users
            const premiumUsers = await User.find({ is_premium: true }).limit(5)
            
            // Get all active subscriptions
            const activeSubscriptions = await Subscription.find({ status: 'ACTIVE' }).limit(10)
            
            // Get all subscriptions for premium users
            const premiumUserSubscriptions = await Subscription.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $match: {
                        'user.is_premium': true
                    }
                },
                {
                    $project: {
                        user_id: 1,
                        status: 1,
                        start_date: 1,
                        end_date: 1,
                        userName: '$user.name',
                        is_premium: '$user.is_premium'
                    }
                }
            ])
            
            return resUtils.sendSuccess(res, 200, 'Debug data fetched successfully', {
                premiumUsers: premiumUsers.map(u => ({
                    _id: u._id,
                    name: u.name,
                    is_premium: u.is_premium
                })),
                activeSubscriptions: activeSubscriptions.map(s => ({
                    _id: s._id,
                    user_id: s.user_id,
                    status: s.status,
                    start_date: s.start_date,
                    end_date: s.end_date
                })),
                premiumUserSubscriptions
            })
        } catch (error) {
            console.error('Debug error:', error)
            return resUtils.sendError(res, 500, error.message)
        }
    }
)

export default apiHandler 