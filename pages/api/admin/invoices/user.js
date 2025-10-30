import nextConnect from 'next-connect'
import paymentsController from 'core/controllers/payments.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import { authenticateAdminMiddleware } from 'core/middleware/admin.middleware'
const handler = nextConnect()

handler.get(
    authenticateTokenMiddleware,
    authenticateAdminMiddleware,
    paymentsController.getAllInvoicesOfUser
)

export default handler
