import nextConnect from 'next-connect'
import userController from 'core/controllers/user.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'

const handler = nextConnect()

handler.put(authenticateTokenMiddleware, userController.updateUserPremiumStatus)

export default handler
