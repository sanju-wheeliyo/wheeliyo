import notificationController from 'core/controllers/notification.controller'
import handler from 'core/config/nextConnect.config'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const apiHandler = handler()

apiHandler.post(
    authenticateTokenMiddleware,
    notificationController.createDummyNotification
)
export default apiHandler
