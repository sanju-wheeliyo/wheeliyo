import nextConnect from 'next-connect'
import cronController from 'core/controllers/cron.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const handler = nextConnect()

handler.post(cronController.updateSubsriptionStatus)

export default handler
