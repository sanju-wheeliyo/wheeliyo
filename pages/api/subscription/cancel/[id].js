import subscriptionController from 'core/controllers/subscription.controller'
import handler from 'core/config/nextConnect.config'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const apiHandler = handler()
apiHandler.put(
    authenticateTokenMiddleware,
    subscriptionController.cancelUserSubscription
)
export default apiHandler
