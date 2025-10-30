import handler from 'core/config/nextConnect.config'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
import paymentService from 'core/services/payment.service'
import userServices from 'core/services/user.services'
import invoiceUtils from 'core/utils/invoice.utils'
import resUtils from 'core/utils/res.utils'

const apiHandler = handler()

apiHandler.get(authenticateTokenMiddleware, async (req, res) => {
    try {
        const { id } = req.query
        const user = req.user

        console.log('🔍 Invoice download request:', {
            invoiceId: id,
            userId: user.id,
            userPhone: user.phone,
        })

        // Validate the ID parameter
        if (!id) {
            console.log('❌ Missing ID parameter')
            return resUtils.sendError(res, 400, 'Missing invoice ID')
        }

        // Check if ID is a valid ObjectId format
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            console.log('❌ Invalid ObjectId format:', id)
            return resUtils.sendError(res, 400, 'Invalid invoice ID format')
        }

        // Find the payment by ID
        console.log('🔍 Looking for payment with ID:', id)
        const payment = await paymentService.findOne(id)

        if (!payment) {
            console.log('❌ Payment not found for ID:', id)
            return resUtils.sendError(res, 404, 'Payment not found')
        }

        console.log('✅ Payment found:', {
            paymentId: payment._id,
            amount: payment.amount,
            paymentStatus: payment.payment_status,
            userId: payment.user_id,
        })

        // Get the user from the payment
        const paymentUser = await userServices.getUserById(payment.user_id)
        if (!paymentUser) {
            console.log('❌ Payment user not found')
            return resUtils.sendError(res, 500, "User doesn't exist")
        }

        const params = {
            content: {
                user: paymentUser,
                payment,
                websiteLink: process.env.NEXT_PUBLIC_WEB_URL,
            },
        }

        // Validate required data
        if (!paymentUser.name || !paymentUser.phone) {
            console.log('❌ Missing essential user data:', {
                name: paymentUser.name,
                phone: paymentUser.phone,
            })
            return resUtils.sendError(
                res,
                500,
                'Incomplete user data for invoice generation'
            )
        }

        // Provide default email if missing
        if (!paymentUser.email) {
            console.log('⚠️ User email missing, using default placeholder')
            paymentUser.email = 'N/A'
        }

        console.log('✅ Final user data for invoice generation:', {
            name: paymentUser.name,
            email: paymentUser.email,
            phone: paymentUser.phone,
            userId: paymentUser._id,
        })

        if (!payment.amount) {
            console.log('❌ Missing payment amount:', payment.amount)
            return resUtils.sendError(
                res,
                500,
                'Incomplete payment data for invoice generation'
            )
        }

        // Generate filename based on available data
        const filename =
            payment.phonepe_merchant_id ||
            payment._id ||
            `invoice_${Date.now()}`

        console.log('📄 Generating invoice with filename:', filename)
        console.log('📄 Template params:', {
            userName: paymentUser.name,
            userEmail: paymentUser.email,
            userPhone: paymentUser.phone,
            paymentAmount: payment.amount,
            paymentId: payment._id,
        })

        try {
            await invoiceUtils.createAndSendPdf(
                `invoice_${filename}`,
                res,
                params,
                'core/assets/template/invoice.template.ejs'
            )
        } catch (templateError) {
            console.error(
                '❌ Error generating invoice template:',
                templateError
            )
            return resUtils.sendError(
                res,
                500,
                'Failed to generate invoice template'
            )
        }
    } catch (error) {
        console.error('❌ Invoice download error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to download invoice',
            error: error.message,
        })
    }
})

export default apiHandler
