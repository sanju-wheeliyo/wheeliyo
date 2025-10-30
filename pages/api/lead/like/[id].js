import nextConnect from 'next-connect'
import leadsController from 'core/controllers/leads.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'

const handler = nextConnect()

handler.use(authenticateTokenMiddleware).post(leadsController.likeLeed)

export default handler
