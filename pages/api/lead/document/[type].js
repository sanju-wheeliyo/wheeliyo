// API endpoint to proxy S3 document requests
import dbConnect from 'core/config/db.config'
import Leads from 'core/models/leads'
import AWS from 'aws-sdk'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'

// Configure AWS S3
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { type } = req.query
        const { leadId } = req.query

        if (!leadId || !type) {
            return res.status(400).json({ error: 'Missing leadId or type parameter' })
        }

        // Authenticate user
        await authenticateTokenMiddleware(req, res, () => {})

        // Get user ID from authenticated request
        const userId = req._id || req.user?.id
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' })
        }

        await dbConnect()

        // Check if user is admin or the lead owner
        const isAdmin = req.user?.role?.name === 'Admin'
        
        let lead
        if (isAdmin) {
            // Admin can access any lead's documents
            lead = await Leads.findById(leadId)
        } else {
            // Regular user can only access their own lead's documents
            lead = await Leads.findOne({ 
                _id: leadId, 
                user_id: userId 
            })
        }
        
        if (!lead || !lead.documents || !lead.documents[type]) {
            return res.status(404).json({ error: 'Document not found or access denied' })
        }

        const document = lead.documents[type]

        // If document has data (stored in MongoDB), return it directly
        if (document.data) {
            res.setHeader('Content-Type', document.contentType)
            if (document.contentType.startsWith('image/')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000')
                res.setHeader('Content-Disposition', 'inline')
            } else if (document.contentType.includes('pdf')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000')
                res.setHeader('Content-Disposition', 'inline')
            } else {
                res.setHeader('Content-Disposition', `attachment; filename="${type}.pdf"`)
            }
            return res.send(document.data)
        }

        // If document has s3Key, fetch from S3
        if (document.s3Key) {
            try {
                console.log('Fetching from S3:', {
                    bucket: process.env.AWS_BUCKET_NAME,
                    key: document.s3Key,
                    type: type
                })

                const s3Object = await s3.getObject({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: document.s3Key,
                }).promise()

                console.log('S3 fetch successful:', {
                    contentType: s3Object.ContentType,
                    size: s3Object.Body.length
                })

                // Set appropriate headers
                res.setHeader('Content-Type', document.contentType || s3Object.ContentType)
                
                if (document.contentType?.startsWith('image/') || s3Object.ContentType?.startsWith('image/')) {
                    res.setHeader('Cache-Control', 'public, max-age=31536000')
                    res.setHeader('Content-Disposition', 'inline')
                } else if (document.contentType?.includes('pdf') || s3Object.ContentType?.includes('pdf')) {
                    res.setHeader('Cache-Control', 'public, max-age=31536000')
                    res.setHeader('Content-Disposition', 'inline')
                } else {
                    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName || type}.pdf"`)
                }

                return res.send(s3Object.Body)
            } catch (s3Error) {
                console.error('S3 Error details:', {
                    error: s3Error.message,
                    code: s3Error.code,
                    statusCode: s3Error.statusCode,
                    bucket: process.env.AWS_BUCKET_NAME,
                    key: document.s3Key
                })
                return res.status(500).json({ 
                    error: 'Failed to fetch document from S3',
                    details: s3Error.message 
                })
            }
        }

        return res.status(404).json({ error: 'Document not found' })
    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
