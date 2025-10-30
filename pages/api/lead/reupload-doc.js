import nextConnect from 'next-connect'
import multer from 'multer'
import leadsController from 'core/controllers/leads.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'

const storage = multer.memoryStorage()
const upload = multer({ storage })

const handler = nextConnect()

handler.use(
    upload.fields([
        { name: 'rc', maxCount: 1 },
        { name: 'puc', maxCount: 1 },
        { name: 'insurance', maxCount: 1 },
        { name: 'car_front', maxCount: 1 },
        { name: 'car_back', maxCount: 1 },
        { name: 'car_left', maxCount: 1 },
        { name: 'car_right', maxCount: 1 },
        { name: 'car_interior_front', maxCount: 1 },
        { name: 'car_frontside_left', maxCount: 1 },
        { name: 'car_frontside_right', maxCount: 1 },
        { name: 'car_backside_right', maxCount: 1 },
        { name: 'car_backside_left', maxCount: 1 },
        { name: 'car_interior_back', maxCount: 1 },
        { name: 'odometer', maxCount: 1 },
        { name: 'service_history', maxCount: 1 },
    ])
)
handler.use(authenticateTokenMiddleware)

handler.put(leadsController.reuploadLeadDoc)

export const config = {
    api: {
        bodyParser: false,
    },
}

export default handler 