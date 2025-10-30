import notificationController from 'core/controllers/notification.controller'
import handler from 'core/config/nextConnect.config'
const apiHandler = handler()

apiHandler.delete(notificationController.deleteNotification)

export default apiHandler
