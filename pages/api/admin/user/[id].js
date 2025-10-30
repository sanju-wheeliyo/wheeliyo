import adminController from 'core/controllers/admin.controller'
import handler from 'core/config/nextConnect.config'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import { authenticateAdminMiddleware } from 'core/middleware/admin.middleware'

const apiHandler = handler()

apiHandler.get(
    authenticateTokenMiddleware,
    authenticateAdminMiddleware,
    adminController.getUserDetailsById
)

export default apiHandler 