import handler from 'core/config/nextConnect.config'
import contactController from 'core/controllers/contact.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import { postAQueryValdations } from 'core/validations/contactus.validations'
const apiHandler = handler()

apiHandler.get('/api/queries/get', contactController.getQueries)

apiHandler.post(
    '/api/queries/post',
    postAQueryValdations,
    contactController.postQuery
)

apiHandler.delete(
    '/api/queries/delete',
    authenticateTokenMiddleware,
    contactController.deleteQuery
)
export default apiHandler
