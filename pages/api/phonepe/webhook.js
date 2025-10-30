import handler from 'core/config/nextConnect.config'
import phonepeController from 'core/controllers/phonepe.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'

const apiHandler = handler()
apiHandler.post('/api/phonepe/webhook', phonepeController.webhookPhonePe)
export default apiHandler
