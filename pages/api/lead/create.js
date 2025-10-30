import nextConnect from 'next-connect'
import multer from 'multer'
import leadsController from 'core/controllers/leads.controller'
import { optionalAuthMiddleware } from 'core/middleware/auth.middleware'

// ✅ Multer setup
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Middleware to handle both JSON and multipart/form-data
const parseBody = async (req, res, next) => {
    const contentType = req.headers['content-type'] || ''

    // If it's JSON (from website), parse it manually
    if (contentType.includes('application/json')) {
        let body = ''
        req.on('data', (chunk) => {
            body += chunk.toString()
        })
        req.on('end', () => {
            try {
                req.body = JSON.parse(body)
                next()
            } catch (err) {
                res.status(400).json({ error: 'Invalid JSON' })
            }
        })
    } else {
        // If it's multipart/form-data (from mobile app), let multer handle it
        next()
    }
}

// ✅ Route handler
const handler = nextConnect()

// Parse body first (for JSON requests)
handler.use(parseBody)

// Then handle file uploads (for multipart requests)
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

// Use optional auth - allows both authenticated (mobile app) and unauthenticated (website) requests
handler.use(optionalAuthMiddleware)

// ✅ Controller
handler.post(leadsController.createLeads)

// ✅ Disable Next.js bodyParser
export const config = {
    api: {
        bodyParser: false,
    },
}

export default handler
