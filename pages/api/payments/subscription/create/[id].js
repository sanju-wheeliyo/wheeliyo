import handler from 'core/config/nextConnect.config'
import paymentv2Controller from 'core/controllers/paymentv2.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const apiHandler = handler()
apiHandler.post(
    authenticateTokenMiddleware,
    paymentv2Controller.createSubscription
)
export default apiHandler
