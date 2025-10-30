import paymentv2Controller from 'core/controllers/paymentv2.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import handler from 'core/config/nextConnect.config'
import { paymentAddressValidator } from 'core/validations/user.validations'
const apiHandler = handler()

apiHandler.post(authenticateTokenMiddleware, paymentv2Controller.verifyPayment)
export default apiHandler
