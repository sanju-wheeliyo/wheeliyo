import handler from 'core/config/nextConnect.config'
import kylasControllers from 'core/controllers/kylas.controller'
import kylasValidation from 'core/validations/kylas.validations'
import { post } from 'core/validations/validator'

export default handler()
    .use('/api/kylas/lead/create', post(kylasValidation.createLead))
    .post('/api/kylas/lead/create', kylasControllers.createLead)
