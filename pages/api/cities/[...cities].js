import handler from 'core/config/nextConnect.config'
import citiesController from 'core/controllers/cities.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const apiHandler = handler()

apiHandler.get('/api/cities/get', citiesController.getCities)
apiHandler.get('/api/cities/nearest', authenticateTokenMiddleware, citiesController.findNearestCity)

apiHandler.post(
    '/api/cities/post',
    authenticateTokenMiddleware,
    citiesController.createACity
)
apiHandler.put(
    '/api/cities/update',
    authenticateTokenMiddleware,
    citiesController.updateACity
)
apiHandler.delete(
    '/api/cities/delete',
    authenticateTokenMiddleware,
    citiesController.deleteACity
)
export default apiHandler
