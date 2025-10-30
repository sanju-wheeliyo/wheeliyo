// core/middleware/upload.middleware.js
import multer from 'multer'

// Store files in memory as Buffer (not saved to disk)
const storage = multer.memoryStorage()

export const upload = multer({
    storage,
    limits: { fileSize: 40 * 1024 * 1024 },
})
