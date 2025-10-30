import nextConnect from 'next-connect'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import leadsController from 'core/controllers/leads.controller'

const handler = nextConnect()

handler.post(authenticateTokenMiddleware, leadsController.deleteLeadByUser)

export default handler 