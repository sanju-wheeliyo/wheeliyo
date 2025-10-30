// pages/api/lead_docs/[type].js
// for downloading the pdf files and viewing images
import dbConnect from 'core/config/db.config'
import Leads from 'core/models/leads'

export default async function handler(req, res) {
    const { leadId, type } = req.query
    await dbConnect()

    const lead = await Leads.findById(leadId)
    if (!lead || !lead.documents[type]) {
        return res.status(404).send('File not found')
    }

    const doc = lead.documents[type]

    // Set content type
    res.setHeader('Content-Type', doc.contentType)

    // Add cache headers for images to improve performance
    if (doc.contentType.startsWith('image/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
        res.setHeader('Content-Disposition', 'inline') // Display inline for images
    } else {
        // For PDFs and other documents, allow download
        res.setHeader('Content-Disposition', `attachment; filename="${type}.pdf"`)
    }

    res.send(doc.data)
}
