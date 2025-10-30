import { verifyJwtToken } from 'core/utils/jwt.utils'
import resUtils from 'core/utils/res.utils'
import userServices from 'core/services/user.services'

export const authenticateTokenMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization
        if (!authorization) {
            return resUtils.sendError(res, 401, 'No auth header')
        }

        // Extract token from "Bearer <token>" format
        const tokenParts = authorization.split(' ')
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return resUtils.sendError(res, 401, 'Invalid authorization format')
        }

        const token = tokenParts[1]
        if (!token) {
            return resUtils.sendError(res, 401, 'No token provided')
        }

        const decodeToken = verifyJwtToken(token)

        if (!decodeToken) {
            return resUtils.sendError(
                res,
                401,
                'Invalid token - failed to decode'
            )
        }

        if (typeof decodeToken === 'string') {
            return resUtils.sendError(
                res,
                401,
                'Invalid token - decoded as string'
            )
        }

        // Check if token has _id field (required for user lookup)
        if (!decodeToken._id) {
            return resUtils.sendError(
                res,
                401,
                'Invalid token payload - missing user ID'
            )
        }

        let user = null
        let userIdentifier = null

        // Handle both phone-based (regular users) and email-based (admin users) authentication
        if (decodeToken.phone) {
            // Regular user authentication via phone
            userIdentifier = decodeToken.phone
            user = await userServices.getUserByPhone(decodeToken.phone)
        } else if (decodeToken.email) {
            // Admin user authentication via email
            userIdentifier = decodeToken.email
            user = await userServices.getUserByEmail(decodeToken.email)
        } else {
            // Neither phone nor email present
            return resUtils.sendError(
                res,
                401,
                'Invalid token payload - missing phone or email field'
            )
        }

        if (!user) {
            return resUtils.sendError(res, 401, 'User not found')
        }

        // Verify user is active and not deleted
        const userData = await userServices.checkUser({
            _id: user._id,
            deletedAt: null,
        })
        if (!userData) {
            return resUtils.sendError(res, 401, 'User is deleted or inactive')
        }

        // Set user data in request
        req.user = {
            _id: user._id, // Use _id consistently
            id: user._id, // Keep id for backward compatibility
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
        }
        req._id = user._id

        next()
    } catch (error) {
        console.error('Auth middleware error:', error)

        // Handle specific JWT errors
        if (error?.name === 'TokenExpiredError') {
            return resUtils.sendError(res, 498, 'Token expired')
        }

        if (error?.name === 'JsonWebTokenError') {
            return resUtils.sendError(res, 401, 'Invalid token format')
        }

        if (error?.name === 'NotBeforeError') {
            return resUtils.sendError(res, 401, 'Token not active')
        }

        // Handle JWT_KEY missing error
        if (error?.message?.includes('secretOrPrivateKey')) {
            console.error('JWT_KEY is not set in environment variables')
            return resUtils.sendError(res, 500, 'Server configuration error')
        }

        return resUtils.sendError(res, 500, 'Internal auth error')
    }
}

/**
 * Optional authentication middleware - allows requests with or without token
 * If token is present and valid, sets req.user
 * If token is absent or invalid, continues without setting req.user
 * This is useful for endpoints that can work both authenticated and unauthenticated
 */
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization

        // If no authorization header, just continue without setting user
        if (!authorization) {
            return next()
        }

        // Extract token from "Bearer <token>" format
        const tokenParts = authorization.split(' ')
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            // Invalid format, but continue without auth for optional middleware
            return next()
        }

        const token = tokenParts[1]
        if (!token) {
            return next()
        }

        const decodeToken = verifyJwtToken(token)

        if (!decodeToken || typeof decodeToken === 'string') {
            // Invalid token, continue without auth
            return next()
        }

        // Check if token has _id field
        if (!decodeToken._id) {
            return next()
        }

        let user = null

        // Handle both phone-based (regular users) and email-based (admin users) authentication
        if (decodeToken.phone) {
            user = await userServices.getUserByPhone(decodeToken.phone)
        } else if (decodeToken.email) {
            user = await userServices.getUserByEmail(decodeToken.email)
        }

        if (user) {
            // Verify user is active and not deleted
            const userData = await userServices.checkUser({
                _id: user._id,
                deletedAt: null,
            })

            if (userData) {
                // Set user data in request
                req.user = {
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                }
                req._id = user._id
            }
        }

        next()
    } catch (error) {
        // For optional auth, if there's any error, just continue without auth
        console.log(
            'Optional auth middleware - continuing without auth:',
            error.message
        )
        next()
    }
}
