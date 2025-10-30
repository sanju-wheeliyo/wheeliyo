// Debug endpoint to check if signed URLs are working
import { retrieveFile } from 'core/utils/storage.utils'
import dbConnect from 'core/config/db.config'
import Leads from 'core/models/leads'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        await dbConnect()

        // Get a sample lead with images
        const sampleLead = await Leads.findOne({
            $or: [
                { image_key: { $exists: true, $ne: null } },
                { 'documents.car_front.s3Key': { $exists: true } },
            ],
        }).limit(1)

        if (!sampleLead) {
            return res.status(404).json({
                error: 'No lead with images found',
                suggestion: 'Upload a lead with images first',
            })
        }

        const results = {
            leadId: sampleLead._id,
            image_key: sampleLead.image_key,
            image_key_signed_url: sampleLead.image_key
                ? retrieveFile.signed(sampleLead.image_key)
                : null,
            documents: {},
            environment: {
                bucket: process.env.AWS_BUCKET_NAME,
                region: process.env.AWS_REGION,
                hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
                hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
            },
        }

        // Test document signed URLs
        if (sampleLead.documents) {
            for (const [docType, docObj] of Object.entries(
                sampleLead.documents
            )) {
                if (docObj?.s3Key) {
                    results.documents[docType] = {
                        s3Key: docObj.s3Key,
                        signedUrl: retrieveFile.signed(docObj.s3Key),
                        hasSignature:
                            retrieveFile
                                .signed(docObj.s3Key)
                                ?.includes('X-Amz-Signature') || false,
                    }
                }
            }
        }

        // Check if image_key signed URL has signature
        if (results.image_key_signed_url) {
            results.image_key_has_signature =
                results.image_key_signed_url.includes('X-Amz-Signature')
        }

        return res.status(200).json({
            success: true,
            message: 'Debug information for signed URL generation',
            ...results,
        })
    } catch (error) {
        console.error('Debug signed URL error:', error)
        return res.status(500).json({
            error: error.message,
            stack:
                process.env.NODE_ENV === 'development'
                    ? error.stack
                    : undefined,
        })
    }
}
