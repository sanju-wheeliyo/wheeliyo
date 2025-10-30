import adminController from 'core/controllers/admin.controller'
import handler from 'core/config/nextConnect.config'
import { createLeadsByAdminValidator } from 'core/validations/leads.validations'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import { authenticateAdminMiddleware } from 'core/middleware/admin.middleware'
import { upload } from 'core/utils/storage.utils'

const apiHandler = handler()

apiHandler.post(
    '/api/admin/leads/create',
    authenticateTokenMiddleware,
    authenticateAdminMiddleware,
    upload.single('file'),
    adminController.createLeads
)

apiHandler.get('/api/admin/leads', adminController.getAllLeadsFilter)
apiHandler.post(
    '/api/admin/leads/create/v2',
    authenticateTokenMiddleware,
    authenticateAdminMiddleware,
    upload.array('files', 10),
    adminController.createLeadsV2
)
export const config = {
    api: {
        bodyParser: false,
    },
}
export default apiHandler
