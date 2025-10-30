import handler from 'core/config/nextConnect.config'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import userServices from 'core/services/user.services'

const apiHandler = handler()

apiHandler.use(authenticateTokenMiddleware)

apiHandler.get(async (req, res) => {
    try {
        const { phone } = req.user
        if (!phone) {
            return res.status(400).json({ error: 'User not found in token' })
        }
        const user = await userServices.getUserByPhone(phone)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        return res.status(200).json({ is_KYC_verified: user.is_KYC_verified })
    } catch (error) {
        console.error('KYC status API error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

export default apiHandler 