import paymentsController from 'core/controllers/payments.controller'
import handler from 'core/config/nextConnect.config'
import paymentv2Controller from 'core/controllers/paymentv2.controller'
const apiHandler = handler()

apiHandler.post(paymentv2Controller.webhooks)
export default apiHandler
