import handler from 'core/config/nextConnect.config'
import carController from 'core/controllers/cars.controller'
import carValidations from 'core/validations/cars.validations'

export default handler()
    // validations
    .use("/api/cars/models/list", carValidations.listModels)
    .use("/api/cars/variants/list", carValidations.listVariants)
    
    // apis
    .get('/api/cars/makes/list', carController.listMakes)
    .get('/api/cars/models/list', carController.listModels)
    .get('/api/cars/variants/list', carController.listVariants)

    .post('/api/cars/makes/change-popular', carController.changeMakePopular)