import { JWT_KEY } from 'core/constants/env.constants'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'

const JWT_EXPIRES_IN = '2h'
const REFRESH_EXPIRES_IN = '30d'

// Validate JWT_KEY on module load
if (!JWT_KEY) {
    console.error('❌ JWT_KEY is not set in environment variables!')
    throw new Error('JWT_KEY environment variable is required')
}

export const createUserJwt = (params) => {
    try {
        // Validate required parameters
        if (!params._id) {
            throw new Error('_id is required to create JWT token')
        }

        const jwtBody = {
            _id: params._id,
            iat: Math.floor(Date.now() / 1000), // Issued at
        }

        // Add optional fields
        if (params.phone) jwtBody.phone = params.phone
        if (params.email) jwtBody.email = params.email
        if (params.role) jwtBody.role = params.role

        const jwtTokenOptions = {
            expiresIn: JWT_EXPIRES_IN,
        }

        const refreshTokenOptions = {
            expiresIn: REFRESH_EXPIRES_IN,
        }

        const jwtToken = jsonwebtoken.sign(jwtBody, JWT_KEY, jwtTokenOptions)
        const refreshToken = jsonwebtoken.sign(
            jwtBody,
            JWT_KEY,
            refreshTokenOptions
        )

        return { jwtToken, refreshToken }
    } catch (error) {
        console.error('Error creating JWT:', error)
        throw error
    }
}

export const verifyJwtToken = (token) => {
    try {
        if (!token) {
            throw new Error('Token is required')
        }

        if (!JWT_KEY) {
            throw new Error('JWT_KEY is not configured')
        }

        const decoded = jsonwebtoken.verify(token, JWT_KEY)

        // Validate decoded token structure
        if (!decoded || typeof decoded !== 'object') {
            throw new Error('Invalid token structure')
        }

        return decoded
    } catch (error) {
        console.error('JWT verification error:', error.message)
        throw error
    }
}
