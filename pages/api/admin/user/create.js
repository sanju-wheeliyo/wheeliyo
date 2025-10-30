import adminController from 'core/controllers/admin.controller'
import handler from 'core/config/nextConnect.config'
import { createLeadsByAdminValidator } from 'core/validations/leads.validations'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import { authenticateAdminMiddleware } from 'core/middleware/admin.middleware'
import { upload } from 'core/utils/storage.utils'

const apiHandler = handler()
apiHandler.post(
    // authenticateTokenMiddleware,
    // authenticateAdminMiddleware,
    adminController.createNewUser
)

export default apiHandler
