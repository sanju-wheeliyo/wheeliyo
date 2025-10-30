const crypto = require('crypto')
const axios = require('axios')
import paymentService from 'core/services/payment.service'
import planService from 'core/services/plan.service'
import roleServices from 'core/services/role.services'
import subscriptionService from 'core/services/subscription.service'
import userServices from 'core/services/user.services'
import { addMonths, removeFromArr } from 'core/utils/js.utils'
import resUtils from 'core/utils/res.utils'
import { GenerateEmailTemplate } from 'core/utils/sendMail.util'
import ParentType from 'core/constants/parent_type.constants'
import EntityTypes from 'core/constants/entity_types.constants'
import notificationService from 'core/services/notification.service'

const PAYMENT_QUEUE = []

// Create new payment method for checkout endpoint
const newPayment = async (req, res) => {
    try {
        const { plan_id, user_id, amount, merchantTransactionId } = req.body

        if (!plan_id || !user_id || !amount) {
            return resUtils.sendError(res, 400, 'Missing required fields', {
                errors: [
                    {
                        message: 'plan_id, user_id, and amount are required',
                        field: 'validation',
                    },
                ],
            })
        }

        const planDetails = await planService.findPlanDetails(plan_id)
        if (!planDetails) {
            return resUtils.sendError(res, 401, 'Plan not found', {
                errors: [{ message: 'Plan Not found', field: 'plan_id' }],
            })
        }

        // Create payment record
        const paymentObject = {
            plan_id: planDetails._id,
            phonepe_merchant_transaction_id:
                merchantTransactionId ||
                `WHL${Date.now()}${Math.floor(Math.random() * 1000000)}`,
            amount: amount,
            amount_total: amount,
            currency: planDetails.currency || 'INR',
            user_id,
            payment_status: 'PENDING',
            payment_date: new Date(),
        }

        const payment = await paymentService.createPayment(paymentObject)

        return resUtils.sendSuccess(res, 200, 'Payment created successfully', {
            payment_id: payment._id,
            merchant_transaction_id: payment.phonepe_merchant_id,
            amount: payment.amount,
            status: payment.payment_status,
        })
    } catch (error) {
        console.error('Error creating payment:', error)
        return resUtils.sendError(res, 500, 'Internal server error', {
            errors: [{ message: error.message, field: 'server' }],
        })
    }
}

// Create payment method for create-payment endpoint
const createPayment = async (req, res) => {
    return newPayment(req, res)
}

// Check payment status from PhonePe API - does NOT create payments or subscriptions
// Payments and subscriptions are only created by the webhook to prevent duplicates
const checkStatus = async (req, res) => {
    const user = req.user
    const { merchantTransactionId, plan_id, user_id } = req.body

    // Check if payment is already being processed
    const isAlreadyInQueue = PAYMENT_QUEUE.find(
        (value) => value === merchantTransactionId
    )

    if (Boolean(isAlreadyInQueue)) {
        // Instead of returning LOADING immediately, let's check if we can get the actual status
        // This prevents the queue from blocking legitimate status checks
        console.log(
            `Payment ${merchantTransactionId} is already in queue, but proceeding with status check`
        )
    } else {
        PAYMENT_QUEUE.push(merchantTransactionId)
    }

    const merchantId =
        process.env.PHONEPE_MERCHANT_ID || process.env.PHONEPAY_MERCHANT_ID
    const keyIndex = process.env.PHONEPE_SALT_INDEX
    const statusCheckUrl = process.env.PHONEPE_STATUS_CHECK_URL
    const saltKey = process.env.PHONEPE_SALT_KEY

    if (!merchantId || !keyIndex || !statusCheckUrl || !saltKey) {
        console.error('Missing PhonePe environment variables:', {
            merchantId: !!merchantId,
            keyIndex: !!keyIndex,
            statusCheckUrl: !!statusCheckUrl,
            saltKey: !!saltKey,
        })
        return resUtils.sendError(res, 500, 'Payment configuration error', {
            errors: [
                {
                    message: 'Payment gateway not configured properly',
                    field: 'server',
                },
            ],
        })
    }

    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}${saltKey}`

    const sha256 = crypto.createHash('sha256').update(string).digest('hex')
    const checksum = sha256 + '###' + keyIndex

    const options = {
        method: 'GET',
        // url: `${process.env.PHONEPE_STATUS_CHECK_URL}/${merchantId}/${merchantTransactionId}`,
        // url: 'https://apps-uat.phonepe.com/v3/transaction/PGTESTPAYUAT132/WHL1728053246106475476/status',
        url: `${statusCheckUrl}/${merchantId}/${merchantTransactionId}`,
        headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': merchantId,
            accept: 'application/json',
        },
    }
    // CHECK PAYMENT STATUS
    try {
        console.log('🔍 Making PhonePe status check request to:', options.url)
        console.log('🔍 Request headers:', options.headers)

        const responseStatus = await axios.request(options)

        console.log('📱 PhonePe API Response Status:', responseStatus.status)
        console.log('📱 PhonePe API Response Headers:', responseStatus.headers)
        console.log(
            '📱 PhonePe API Response Data:',
            JSON.stringify(responseStatus.data, null, 2)
        )

        let payment_status = ''
        const responseCode = responseStatus?.data?.code
        const responseStatusText = responseStatus?.data?.status
        const responseSuccess = responseStatus?.data?.success

        console.log('🔍 Extracted PhonePe response values:', {
            code: responseCode,
            status: responseStatusText,
            success: responseSuccess,
            fullResponse: responseStatus?.data,
        })

        // More comprehensive status checking with better debugging
        console.log('Analyzing PhonePe response for status determination...')

        // Check for SUCCESS indicators
        if (
            responseCode === 'PAYMENT_SUCCESS' ||
            responseStatusText === 'SUCCESS' ||
            responseSuccess === true ||
            responseStatus?.data?.status === 'SUCCESS' ||
            responseStatus?.data?.code === 'PAYMENT_SUCCESS' ||
            responseStatus?.data?.data?.code === 'PAYMENT_SUCCESS'
        ) {
            payment_status = 'SUCCESS'
            console.log('✅ Payment status determined as SUCCESS')
        }
        // Check for FAILED indicators
        else if (
            responseCode === 'PAYMENT_ERROR' ||
            responseStatusText === 'FAILED' ||
            responseSuccess === false ||
            responseStatus?.data?.status === 'FAILED' ||
            responseStatus?.data?.code === 'PAYMENT_ERROR' ||
            responseStatus?.data?.data?.code === 'PAYMENT_ERROR'
        ) {
            payment_status = 'FAILED'
            console.log('❌ Payment status determined as FAILED')
        }
        // Check for PENDING indicators
        else if (
            responseCode === 'PAYMENT_INITIATED' ||
            responseStatusText === 'PENDING' ||
            responseStatus?.data?.status === 'PENDING' ||
            responseCode === 'PAYMENT_PENDING' ||
            responseStatusText === 'INITIATED'
        ) {
            payment_status = 'PENDING'
            console.log('⏳ Payment status determined as PENDING')
        }
        // Fallback: Look for any success indicators in the response
        else {
            console.log(
                '🔍 No clear status found, checking for success indicators...'
            )

            // Check multiple levels for success indicators
            const hasSuccessIndicator =
                responseSuccess === true ||
                responseStatus?.data?.success === true ||
                responseStatus?.data?.data?.success === true ||
                responseStatus?.data?.data?.data?.success === true ||
                responseStatus?.data?.status === 'SUCCESS' ||
                responseStatus?.data?.data?.status === 'SUCCESS' ||
                responseStatus?.data?.data?.data?.status === 'SUCCESS'

            if (hasSuccessIndicator) {
                payment_status = 'SUCCESS'
                console.log(
                    '✅ Payment status determined as SUCCESS (from success indicators)'
                )
            } else {
                payment_status = 'UNKNOWN'
                console.log('❓ Payment status determined as UNKNOWN')
            }
        }

        // Check if payment already exists in database
        const existingPayment = await paymentService.findPaymentByOrderId(merchantTransactionId)
        
        if (existingPayment) {
            console.log('📋 Payment already exists in database, returning existing status')
            // Return existing payment data
            removeFromArr(PAYMENT_QUEUE, merchantTransactionId)
            return resUtils.sendSuccess(res, 200, 'Payment status', {
                success: existingPayment.payment_status === 'SUCCESS',
                status: existingPayment.payment_status,
                data: {
                    data: {
                        data: {
                            code: existingPayment.payment_status === 'SUCCESS' ? 'PAYMENT_SUCCESS' : existingPayment.payment_status,
                            status: existingPayment.payment_status,
                            success: existingPayment.payment_status === 'SUCCESS',
                            message: 'Payment status retrieved from database',
                        },
                    },
                },
                message: 'Payment status retrieved from database',
                merchantTransactionId,
                plan_id,
                user_id,
            })
        }

        // Return response in the format expected by the mobile app
        const responseData = {
            success: payment_status === 'SUCCESS',
            status: payment_status,
            data: {
                data: {
                    data: {
                        code:
                            responseStatus.data.code ||
                            responseCode ||
                            'UNKNOWN',
                        status: payment_status,
                        success: payment_status === 'SUCCESS',
                        message:
                            responseStatus.data.message ||
                            'Payment status retrieved',
                    },
                },
            },
            message: 'Payment status check fetched successfully',
            merchantTransactionId,
            plan_id,
            user_id,
        }

        console.log(
            '📤 Sending response to mobile app:',
            JSON.stringify(responseData, null, 2)
        )

        removeFromArr(PAYMENT_QUEUE, merchantTransactionId)
        return resUtils.sendSuccess(res, 200, 'Payment status', responseData)
    } catch (error) {
        console.error('Error in checkStatus:', error)

        // Remove from queue if there was an error
        removeFromArr(PAYMENT_QUEUE, merchantTransactionId)

        // Return error response
        return resUtils.sendError(res, 500, 'Payment status check failed', {
            errors: [{ message: error.message, field: 'server' }],
        })
    }
}

const decodeBase64 = (encodedString) => {
    const buff = Buffer.from(encodedString, 'base64')
    return buff.toString('utf-8')
}

// Single source of truth for payment processing - creates payments, subscriptions, and sends emails
// This prevents duplicate processing that was happening in checkStatus function
const webhookPhonePe = async (req, res) => {
    try {
        const payload = req.body
        const params = req.query

        console.log('📞 PhonePe webhook received:', {
            body: payload,
            query: params,
            timestamp: new Date().toISOString(),
        })

        const decodedPayload = JSON.parse(decodeBase64(payload?.response))

        const { state, responseCode, merchantTransactionId } =
            decodedPayload?.data

        console.log('🔍 Decoded webhook data:', {
            state,
            responseCode,
            merchantTransactionId,
        })

        const isAlreadyInQueue = PAYMENT_QUEUE.find(
            (value) => value === merchantTransactionId
        )

        if (Boolean(isAlreadyInQueue)) {
            console.log(
                `Webhook: Payment ${merchantTransactionId} is already in queue, but proceeding with processing`
            )
        } else {
            PAYMENT_QUEUE.push(merchantTransactionId)
            console.log(`📥 Added ${merchantTransactionId} to payment queue`)
        }

        let payment_status = ''
        console.log('PhonePe webhook data:', {
            state,
            responseCode,
            merchantTransactionId,
            fullPayload: decodedPayload,
        })

        if (state === 'COMPLETED' && responseCode === 'SUCCESS') {
            payment_status = 'SUCCESS'
        } else if (state === 'FAILED' || responseCode === 'FAILED') {
            payment_status = 'FAILED'
        } else if (state === 'PENDING' || responseCode === 'PENDING') {
            payment_status = 'PENDING'
        } else {
            payment_status = responseCode || 'UNKNOWN'
        }

        const planDetails = await planService.findPlanDetails(params?.plan_id)

        if (!planDetails) {
            return resUtils.sendError(res, 401, 'Not found', {
                errors: [{ message: 'Plan Not found', field: 'plan_id' }],
            })
        }

        const createdDate = new Date()

        const paymentObject = {
            plan_id: planDetails?._id,
            phonepe_merchant_transaction_id: merchantTransactionId,
            amount: planDetails?.amount,
            amount_total: planDetails?.amount,
            currency: planDetails?.currency,
            user_id: params?.user_id,
            payment_status,
            payment_date: createdDate,
        }

        const retVal = await paymentService.createPayment(paymentObject)
        console.log('💳 Payment created in webhook:', {
            paymentId: retVal?._id,
            paymentObject,
            retVal,
        })

        const user = await userServices.getUserById(params?.user_id)

        const subscription = await subscriptionService.findSubscriptionByTxnId(
            merchantTransactionId
        )

        if (!subscription && payment_status === 'SUCCESS') {
            // Double-check that no subscription exists for this user and plan
            const existingSubscription =
                await subscriptionService.getActivePlan(params?.user_id)
            if (
                existingSubscription &&
                existingSubscription.plan_id._id.toString() === params?.plan_id
            ) {
                console.log(
                    'ℹ️ Subscription already exists for user and plan, skipping webhook creation'
                )
                removeFromArr(PAYMENT_QUEUE, merchantTransactionId)
                return res.status(200).send({
                    success: true,
                    message:
                        'Subscription already exists, webhook processed successfully',
                    transactionId: merchantTransactionId,
                    status: payment_status,
                    plan_id: params?.plan_id,
                    user_id: params?.user_id,
                })
            }

            console.log('📝 Creating subscription from PhonePe webhook')

            const start_date = new Date()
            const end_date = addMonths(
                start_date,
                parseInt(planDetails.interval)
            )

            await subscriptionService.createSubscription({
                status: 'ACTIVE',
                end_date: end_date,
                plan_id: retVal?.plan_id,
                start_date: start_date,
                user_id: retVal.user_id,
                phonepe_merchant_transaction_id: merchantTransactionId,
            })

            console.log('✅ Subscription created from webhook successfully')

            // payment success Email notification for the user
            const GenerateEmailTemplateArgs = {
                receivers: [user?.email],
                content: { user, payment: retVal },
                subject: 'Payment confirmation mail',
                templatePath: 'core/assets/template/invoice.template.ejs',
            }
            await GenerateEmailTemplate(GenerateEmailTemplateArgs)
            await userServices.updateUserById(user._id, {
                is_premium: true,
            })

            const adminRole = await roleServices.FindRoleDetailsByName('Admin')
            const admin_notifiers = await userServices.findRoleNotifiers(
                adminRole?._id
            )
            const notifier_ids = admin_notifiers.map((notifier) => {
                return notifier._id
            })

            const Meta = {
                title: `Dealer subscribed `,
                body: `A dealer  subscribed to  plan. Visit their profile to view details`,
            }
            const notifications = []
            for (const admin_id of notifier_ids) {
                const notification = {
                    actor: user._id,
                    notifier: admin_id,
                    parent_id: user._id,
                    parent_type: ParentType.User,
                    entity_type: EntityTypes.DEALER_SUBSCRIBED,
                    read: false,
                    meta: Meta,
                    isDeleted: false,
                }
                notifications.push(notification)
            }
            removeFromArr(PAYMENT_QUEUE, merchantTransactionId)
            const notificationRs = await notificationService.createNotification(
                notifications
            )
        }
        return res.status(200).send({
            success: true,
            message: 'Payment webhook processed successfully',
            transactionId: merchantTransactionId,
            status: payment_status,
            plan_id: params?.plan_id,
            user_id: params?.user_id,
        })
    } catch (error) {
        console.error('Error in webhookPhonePe:', error)

        // Remove from queue if there was an error
        removeFromArr(PAYMENT_QUEUE, merchantTransactionId)

        // Return error response
        return res.status(500).send({
            success: false,
            message: 'Webhook processing failed',
            error: error.message,
        })
    }
}

module.exports = {
    newPayment,
    createPayment,
    checkStatus,
    webhookPhonePe,
}
