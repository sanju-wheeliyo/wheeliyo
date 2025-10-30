import handler from 'core/config/nextConnect.config'
import userController from 'core/controllers/auth.controller'

export default handler().post('/api/role/create', userController.registerUser)
