import handler from 'core/config/nextConnect.config'
import { createLeadsValidator } from 'core/validations/leads.validations'
import leadsController from 'core/controllers/leads.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const apiHandler = handler()

apiHandler.post('/api/leads/create',authenticateTokenMiddleware,createLeadsValidator, leadsController.createLeads)
apiHandler.get('/api/leads/fuel_types', leadsController.getFuelTypes)
apiHandler.get(
    '/api/leads/transmission_types',
    leadsController.getTransmissionTypes
)
apiHandler.get(
    '/api/leads/getAll',
    authenticateTokenMiddleware,
    leadsController.getLeads
)
apiHandler.post(
    '/api/leads/like',
    authenticateTokenMiddleware,
    leadsController.likeLeed
)
apiHandler.get('/api/leads/[id]', leadsController.getLeadDetails)
export default apiHandler
