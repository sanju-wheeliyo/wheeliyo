import paymentsController from 'core/controllers/payments.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import handler from 'core/config/nextConnect.config'
import { paymentAddressValidator } from 'core/validations/user.validations'
const apiHandler = handler()

apiHandler.post(
    authenticateTokenMiddleware,
    paymentAddressValidator,
    paymentsController.createStripeCustomer
)
export default apiHandler
