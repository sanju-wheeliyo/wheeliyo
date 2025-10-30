import nextConnect from 'next-connect'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import { upload } from 'core/middleware/upload.middleware'
import userController from 'core/controllers/user.controller'

const handler = nextConnect()

handler.use(
    upload.fields([
        { name: 'aadhar_front', maxCount: 1 },
        { name: 'aadhar_back', maxCount: 1 },
        { name: 'photo', maxCount: 1 },
    ])
)

handler.put(authenticateTokenMiddleware, userController.uploadUserDocs)

export const config = {
    api: {
        bodyParser: false,
    },
}

export default handler
