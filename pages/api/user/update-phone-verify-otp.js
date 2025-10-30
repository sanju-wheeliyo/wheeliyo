import nextConnect from 'next-connect'
import authController from 'core/controllers/auth.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'

const handler = nextConnect()

handler.post(
    authenticateTokenMiddleware,
    authController.verifyPhoneUpdateOtp
)

export default handler 