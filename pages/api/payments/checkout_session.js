import paymentV2Controller from 'core/controllers/paymentv2.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import handler from 'core/config/nextConnect.config'
const apiHandler = handler()
apiHandler.post(
    authenticateTokenMiddleware,
    paymentV2Controller.CreateCheckoutSession
)
export default apiHandler
