import ejs from 'ejs'
import resUtils from './res.utils'
import { chromium } from 'playwright'
import fs from 'fs'
const createAndSendPdf = async (
    fileName,
    res,
    data = {},
    templatePath,
    otherOptions = {}
) => {
    try {
        console.log('Starting PDF generation for:', fileName)
        console.log('Template path:', templatePath)
        console.log('Data keys:', Object.keys(data))
        
        const htmlContent = await ejs.renderFile(templatePath, {
            content: data,
        })
        
        console.log('HTML content generated, length:', htmlContent.length)
        
        const launchOptions = { headless: true }
        // Use Linux-specific executablePath only when available; otherwise let Playwright resolve it
        if (process.platform === 'linux' && fs.existsSync('/usr/bin/chromium-browser')) {
            launchOptions.executablePath = '/usr/bin/chromium-browser'
        }
        
        console.log('Launching browser with options:', launchOptions)
        const browser = await chromium.launch(launchOptions)
        
        console.log('Browser launched, creating page')
        const page = await browser.newPage()
        
        console.log('Setting page content')
        await page.setContent(htmlContent, { waitUntil: 'networkidle' })
        
        console.log('Generating PDF')
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        })
        
        console.log('PDF generated, size:', pdfBuffer.length)
        await browser.close()
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}.pdf"`
        )

        res.setHeader('Content-Length', pdfBuffer.length)
        resUtils.sendSuccess(
            res,
            200,
            'PDF created and sent successfully',
            pdfBuffer
        )
        
        console.log('PDF sent successfully')
    } catch (error) {
        console.error('Error in PDF generation:', error)
        console.error('Error stack:', error.stack)
        
        // Send error response instead of just logging
        res.status(500).json({
            error: 'PDF generation failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
}
export default { createAndSendPdf }
