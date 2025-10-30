// core/middleware/kyc.middleware.js
import resUtils from 'core/utils/res.utils'
import userServices from 'core/services/user.services'

export const requireKYCVerified = async (req, res, next) => {
    try {
        const userId = req._id || req.user?.id

        if (!userId) {
            return resUtils.sendError(res, 401, 'Unauthorized')
        }

        const user = await userServices.getUserById(userId)

        if (user?.is_KYC_verified !== 'approved') {
            return resUtils.sendError(
                res,
                400,
                'Your KYC must be approved before creating a lead'
            )
        }

        next()
    } catch (error) {
        console.error('KYC middleware error:', error)
        return resUtils.sendError(res, 500, 'Internal Server Error')
    }
}
