import nextConnect from 'next-connect'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import userController from 'core/controllers/user.controller'

const handler = nextConnect()

handler.get(authenticateTokenMiddleware, userController.getUserDocByType)

export default handler
