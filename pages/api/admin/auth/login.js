import userServices from 'core/services/user.services'
import roleServices from 'core/services/role.services'
import resUtils from 'core/utils/res.utils'
import {
    validatePassword,
    generateHashPassword,
} from 'core/utils/password.utils'
import { createUserJwt } from 'core/utils/jwt.utils'
import dbConnect from 'core/config/db.config'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return resUtils.sendError(res, 405, 'Method Not Allowed')
    }
    try {
        await dbConnect()
    } catch (err) {
        console.error('Admin login DB connect error:', err)
        return resUtils.sendError(res, 500, 'Internal server error')
    }
    const { email, password } = req.body
    if (!email || !password) {
        return resUtils.sendError(res, 400, 'Email and password are required')
    }
    try {
        const user = await userServices.getUserByEmail(email)
        if (!user) {
            return resUtils.sendError(res, 400, 'User not found')
        }

        // Check if user is admin - handle both populated and unpopulated role
        const userRole = user.role

        // If role is populated (object), check type
        if (userRole && typeof userRole === 'object' && userRole.type) {
            if (userRole.type !== 'ADMIN') {
                return resUtils.sendError(res, 403, 'Not an admin user')
            }
        } else {
            // If role is just an ID, we need to fetch the role
            const role = await roleServices.getRole(userRole)
            if (!role || role.type !== 'ADMIN') {
                return resUtils.sendError(res, 403, 'Not an admin user')
            }
        }

        // Validate password
        const isValid = await validatePassword(password, user.password)
        if (!isValid) {
            return resUtils.sendError(res, 400, 'Invalid password')
        }

        // Generate tokens - only include phone if it exists
        const jwtPayload = {
            _id: user._id,
            email: user.email,
            role: 'ADMIN',
        }

        // Only add phone if user has one
        if (user.phone) {
            jwtPayload.phone = user.phone
        }

        const { jwtToken, refreshToken } = createUserJwt(jwtPayload)

        // Return tokens and user info
        return resUtils.sendSuccess(res, 200, 'Admin login successful', {
            accessToken: jwtToken,
            refreshToken,
            user,
        })
    } catch (error) {
        console.error('Admin login error:', error)
        return resUtils.sendError(res, 500, 'Internal server error')
    }
}
