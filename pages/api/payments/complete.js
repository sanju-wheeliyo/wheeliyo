import paymentsController from 'core/controllers/payments.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import handler from 'core/config/nextConnect.config'
const apiHandler = handler()
apiHandler.get(
    authenticateTokenMiddleware,
    paymentsController.checkCheckoutStatus
)
export default apiHandler
