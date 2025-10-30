import paymentv2Controller from 'core/controllers/paymentv2.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import handler from 'core/config/nextConnect.config'

const apiHandler = handler()

apiHandler.get(
    authenticateTokenMiddleware,
    paymentv2Controller.downloadInvoiceController
)

export default apiHandler
