import adminController from 'core/controllers/admin.controller'
import handler from 'core/config/nextConnect.config'
import { upload } from 'core/utils/storage.utils'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import { authenticateAdminMiddleware } from 'core/middleware/admin.middleware'
const apiHandler = handler()

apiHandler.put(
    authenticateTokenMiddleware,
    authenticateAdminMiddleware,
    upload.array('files', 10),
    adminController.updateLeadV2
)

export const config = {
    api: {
        bodyParser: false,
    },
}
export default apiHandler
