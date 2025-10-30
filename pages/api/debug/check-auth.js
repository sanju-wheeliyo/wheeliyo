import dbConnect from 'core/config/db.config'
import User from 'core/models/users'
import Subscription from 'core/models/subscription'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        await dbConnect()

        // Check if user is authenticated
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No auth header or invalid format',
                authHeader: authHeader || 'missing'
            })
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // For now, let's just check if the token exists and has some content
        if (!token || token.length < 10) {
            return res.status(401).json({
                success: false,
                message: 'Token too short or invalid',
                tokenLength: token?.length || 0
            })
        }

        // Since we can't verify JWT without the secret, let's check if there are any users
        // and show what we can about the authentication setup
        const totalUsers = await User.countDocuments()
        const premiumUsers = await User.countDocuments({ is_premium: true })
        const activeSubscriptions = await Subscription.countDocuments({ status: 'ACTIVE' })

        res.status(200).json({
            success: true,
            message: 'Auth check completed',
            data: {
                tokenReceived: true,
                tokenLength: token.length,
                tokenPreview: token.substring(0, 20) + '...',
                database: {
                    totalUsers,
                    premiumUsers,
                    activeSubscriptions
                },
                note: 'Token format looks correct. If you\'re still getting auth errors, the token may be expired or invalid.'
            }
        })
    } catch (error) {
        console.error('❌ Error checking auth:', error)
        res.status(500).json({
            success: false,
            message: 'Error checking auth',
            error: error.message
        })
    }
}
