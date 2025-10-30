import handler from 'core/config/nextConnect.config'
import countriesController from 'core/controllers/countries.controller'
const apiHandler = handler()

apiHandler.get('/api/countries/get', countriesController.getCountries)

export default apiHandler
