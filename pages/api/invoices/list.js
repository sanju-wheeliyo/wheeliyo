import nextConnect from 'next-connect'
import paymentsController from 'core/controllers/payments.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const handler = nextConnect()

handler.get(authenticateTokenMiddleware, paymentsController.getAllInvoices)

export default handler
