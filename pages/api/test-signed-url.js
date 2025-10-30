// Temporary test endpoint to verify signed URL generation
import { retrieveFile } from 'core/utils/storage.utils'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { key } = req.query

        if (!key) {
            return res.status(400).json({
                error: 'Missing key parameter',
                example: '/api/test-signed-url?key=lead_images/some-image.jpg',
            })
        }

        const signedUrl = retrieveFile.signed(key)

        return res.status(200).json({
            success: true,
            originalKey: key,
            signedUrl: signedUrl,
            signedUrlPreview: signedUrl?.substring(0, 150) + '...',
            hasSignature: signedUrl?.includes('X-Amz-Signature'),
            bucket: process.env.AWS_BUCKET_NAME,
            region: process.env.AWS_REGION,
        })
    } catch (error) {
        console.error('Test signed URL error:', error)
        return res.status(500).json({
            error: error.message,
            stack:
                process.env.NODE_ENV === 'development'
                    ? error.stack
                    : undefined,
        })
    }
}
