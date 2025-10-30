import { verifyJwtToken } from 'core/utils/jwt.utils'
import userServices from 'core/services/user.services'
import roleServices from 'core/services/role.services'
import resUtils from 'core/utils/res.utils'

export default async function handler(req, res) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return resUtils.sendError(res, 401, 'Unauthorized')
        }
        const token = authHeader.split(' ')[1]
        let decoded
        try {
            decoded = verifyJwtToken(token)
        } catch (err) {
            return resUtils.sendError(res, 401, 'Invalid token')
        }
        const user = await userServices.getUserById(decoded._id)
        if (!user) {
            return resUtils.sendError(res, 401, 'User not found')
        }

        // Check if user is admin - handle both populated and unpopulated role
        const userRole = user.role

        // If role is populated (object), check type
        if (userRole && typeof userRole === 'object' && userRole.type) {
            if (userRole.type !== 'ADMIN') {
                return resUtils.sendError(res, 401, 'Not an admin user')
            }
        } else {
            // If role is just an ID, we need to fetch the role
            const role = await roleServices.getRole(userRole)
            if (!role || role.type !== 'ADMIN') {
                return resUtils.sendError(res, 401, 'Not an admin user')
            }
        }

        return resUtils.sendSuccess(res, 200, 'Admin info', user)
    } catch (error) {
        console.error('Admin me error:', error)
        return resUtils.sendError(res, 500, 'Internal server error')
    }
}
