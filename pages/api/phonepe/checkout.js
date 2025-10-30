import handler from 'core/config/nextConnect.config'
import phonepeController from 'core/controllers/phonepe.controller'

const apiHandler = handler()
apiHandler.post('/api/phonepe/checkout', phonepeController.newPayment)
export default apiHandler
