import handler from 'core/config/nextConnect.config'
import adminController from 'core/controllers/admin.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import { authenticateAdminMiddleware } from 'core/middleware/admin.middleware'

const apiHandler = handler()

apiHandler.put(
    authenticateTokenMiddleware,
    authenticateAdminMiddleware,
    (req, res) => {
        if (req.body.leadId) {
            return adminController.verifyLeadDocStatus(req, res);
        } else {
            return adminController.verifyUserDocStatus(req, res);
        }
    }
)

// ✅ No `bodyParser: false`
export default apiHandler