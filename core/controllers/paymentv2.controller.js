import { createOrder } from 'core/utils/razorpay.utils'
import planService from 'core/services/plan.service'
import resUtils from 'core/utils/res.utils'
import paymentService from 'core/services/payment.service'
import subscriptionService from 'core/services/subscription.service'
import userServices from 'core/services/user.services'
import { GenerateEmailTemplate } from 'core/utils/sendMail.util'
import notificationService from 'core/services/notification.service'
import ParentType from 'core/constants/parent_type.constants'
import EntityTypes from 'core/constants/entity_types.constants'
import roleServices from 'core/services/role.services'
import { removeFromArr, addMonths } from 'core/utils/js.utils'
import crypto from 'crypto'
import invoiceUtils from 'core/utils/invoice.utils'
const {
    validateWebhookSignature,
} = require('razorpay/dist/utils/razorpay-utils')
const PAYMENT_QUEUE = []
const createPaymentOrder = async (req, res, next) => {
    try {
        const user = req.user
        const { plan_id } = req.body
        const planDetails = await planService.findPlanDetails(plan_id)
        if (!planDetails) {
            return resUtils.sendError(res, 401, 'Not found', {
                errors: [{ message: 'Plan Not found', field: 'plan_id' }],
            })
        }
        console.log({ planDetails })

        var options = {
            amount: planDetails.amount * 100, // amount in the smallest currency unit
            currency: planDetails.currency,
        }

        const orderResponse = await createOrder(options)
        const createdDate = new Date() // Multiply by 1000 to convert seconds to milliseconds

        const paymentObject = {
            plan_id: planDetails._id,
            order_id: orderResponse.id,
            amount: planDetails.amount,
            amount_total: planDetails.amount,
            currency: orderResponse.currency,
            user_id: user._id,
            payment_status: 'PENDING',
            payment_date: createdDate,
        }

        await paymentService.createPayment(paymentObject)
        return resUtils.sendSuccess(res, 200, 'Order created successfully', {
            order: orderResponse,
            planDetails: planDetails,
        })
    } catch (error) {
        console.log('ERROR::', error)
        next(error)
    }
}
const verifyPayment = async (req, res) => {
    const user = req.user
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body

    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex')
    // checking payment processing is ongoing

    const isAlreadyInQueue = PAYMENT_QUEUE.find(
        (value) => value === razorpay_order_id
    )

    if (isAlreadyInQueue) {
        return resUtils.sendSuccess(res, 200, 'Payment Loading', {
            status: 'LOADING',
        })
    }
    PAYMENT_QUEUE.push(razorpay_order_id)
    console.log(generated_signature == razorpay_signature, 'ss')
    if (generated_signature == razorpay_signature) {
        //payment success
        await paymentService.updatePaymentByOrderId(razorpay_order_id, {
            payment_status: 'SUCCESS',
        })
        removeFromArr(PAYMENT_QUEUE, razorpay_order_id)
        return resUtils.sendSuccess(res, 200, 'Payment verified', {
            status: 'PAYMENT_VERIFIED',
        })
    } else {
        return resUtils.sendError(res, 400, 'Payment verification failed')
    }
}
const webhooks = async (req, res) => {
    try {
        const webhook_body = req.body
        const signature = req.headers['x-razorpay-signature']
        const isValid = await validateWebhookSignature(
            JSON.stringify(req.body),
            signature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        )

        if (isValid) {
            const event = webhook_body.event
            const orderId = event.payload.payment.entity.order_id
            const isAlreadyInQueue = PAYMENT_QUEUE.find(
                (value) => value === orderId
            )
            if (!isAlreadyInQueue) {
                PAYMENT_QUEUE.push(orderId)
                switch (event) {
                    case 'payment.captured':
                        await paymentService.updatePaymentByOrderId(orderId, {
                            status: 'SUCCESS',
                        })

                        const payment =
                            await paymentService.findPaymentByOrderId(orderId)

                        const subscription =
                            await subscriptionService.findSubscriptionByTxnId(
                                orderId
                            )
                        if (!subscription) {
                            const start_date = new Date()
                            const end_date = addMonths(
                                parseInt(planDetails.interval)
                            )
                            await subscriptionService.createSubscription({
                                plan_id: payment.plan_id,
                                user_id: payment.user_id,
                                razorpay_order_id: orderId,
                                start_date: start_date,
                                end_date: end_date,
                                status: 'ACTIVE',
                            })
                            // payment success Email notification for the user

                            const GenerateEmailTemplateArgs = {
                                receivers: [user?.email],
                                content: { user, payment },
                                subject: 'Payment confirmation mail',
                                templatePath:
                                    'core/assets/template/invoice.template.ejs',
                            }
                            await GenerateEmailTemplate(
                                GenerateEmailTemplateArgs
                            )

                            await userServices.updateUserById(user._id, {
                                is_premium: true,
                            })

                            const adminRole =
                                await roleServices.FindRoleDetailsByName(
                                    'Admin'
                                )
                            const admin_notifiers =
                                await userServices.findRoleNotifiers(
                                    adminRole._id
                                )
                            const notifier_ids = admin_notifiers.map(
                                (notifier) => {
                                    return notifier._id
                                }
                            )

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
                            removeFromArr(PAYMENT_QUEUE, order_id)
                            return await notificationService.createNotification(
                                notifications
                            )
                        }
                        break
                    case 'payment.failed':
                        await paymentService.updatePaymentByOrderId(orderId, {
                            payment_status: 'FAILED',
                        })
                        break
                    default:
                        console.log('Unhandled event type')
                }
            }
        }

        return resUtils.sendSuccess(res, 200, { received: true })
    } catch (error) {
        console.log(error)
    }
}
const createSubscription = async (req, res, next) => {
    try {
        const user = req.user
        const { id } = req.query

        console.log('🔍 Subscription creation requested:', {
            userId: user._id,
            id,
            idLength: id?.length,
        })

        // Check if this is a PhonePe payment by looking for existing subscription with plan_id
        if (id && id.length === 24) {
            // MongoDB ObjectId length is 24
            console.log('📱 PhonePe payment detected - plan_id:', id)

            // This is likely a plan_id from PhonePe payment
            const planDetails = await planService.findPlanDetails(id)
            if (!planDetails) {
                console.log('❌ Plan not found for ID:', id)
                return resUtils.sendError(res, 400, 'Invalid plan ID')
            }

            console.log('✅ Plan found:', {
                planId: planDetails._id,
                interval: planDetails.interval,
            })

            // Check if user already has an active subscription for this plan
            const existingSubscription =
                await subscriptionService.getActivePlan(user._id)
            if (
                existingSubscription &&
                existingSubscription.plan_id._id.toString() === id
            ) {
                console.log('ℹ️ Subscription already exists for user and plan')
                return resUtils.sendSuccess(
                    res,
                    200,
                    'Subscription already exists for this plan'
                )
            }

            // For PhonePe, we need to find the payment by user_id and plan_id
            const payment = await paymentService.findPaymentByUserAndPlan(
                user._id,
                id
            )

            // If no payment found, check if subscription was created by webhook
            if (!payment) {
                console.log(
                    '❌ No payment found for user and plan, checking if subscription exists:',
                    {
                        userId: user._id,
                        planId: id,
                    }
                )

                // Check if subscription was created by PhonePe webhook
                const webhookSubscription =
                    await subscriptionService.getActivePlan(user._id)
                if (
                    webhookSubscription &&
                    webhookSubscription.plan_id._id.toString() === id
                ) {
                    console.log(
                        '✅ Subscription found from webhook, returning success'
                    )
                    return resUtils.sendSuccess(
                        res,
                        200,
                        'Subscription already exists for this plan (created by webhook)'
                    )
                }

                return resUtils.sendError(
                    res,
                    400,
                    'No payment found for this plan'
                )
            }

            console.log('✅ Payment found:', {
                paymentId: payment._id,
                status: payment.payment_status,
                txnId:
                    payment.phonepe_merchant_transaction_id ||
                    payment.razorpay_order_id,
            })

            // Check if subscription already exists for this payment
            const subscription =
                await subscriptionService.findSubscriptionByTxnId(
                    payment.phonepe_merchant_transaction_id ||
                        payment.razorpay_order_id
                )

            if (!subscription) {
                console.log('📝 Creating new subscription for PhonePe payment')

                // Double-check that no subscription exists for this user and plan
                const duplicateCheck = await subscriptionService.getActivePlan(
                    user._id
                )
                if (
                    duplicateCheck &&
                    duplicateCheck.plan_id._id.toString() === id
                ) {
                    console.log(
                        'ℹ️ Duplicate subscription detected, skipping creation'
                    )
                    return resUtils.sendSuccess(
                        res,
                        200,
                        'Subscription already exists for this plan'
                    )
                }

                const start_date = new Date()
                const end_date = addMonths(
                    start_date,
                    parseInt(planDetails.interval)
                )

                const subscriptionData = {
                    plan_id: planDetails._id,
                    user_id: user._id,
                    phonepe_merchant_transaction_id:
                        payment.phonepe_merchant_transaction_id,
                    razorpay_order_id: payment.razorpay_order_id,
                    start_date: start_date,
                    end_date: end_date,
                    status: 'ACTIVE',
                }

                console.log('📋 Subscription data:', subscriptionData)

                await subscriptionService.createSubscription(subscriptionData)
                console.log('✅ Subscription created successfully')

                // Update user premium status
                await userServices.updateUserById(user._id, {
                    is_premium: true,
                })
                console.log('✅ User premium status updated')

                // Send email notification
                const GenerateEmailTemplateArgs = {
                    receivers: [user?.email],
                    content: { user, payment },
                    subject: 'Payment confirmation mail',
                    templatePath: 'core/assets/template/invoice.template.ejs',
                }
                await GenerateEmailTemplate(GenerateEmailTemplateArgs)
                console.log('✅ Email notification sent')

                // Create admin notifications
                const adminRole = await roleServices.FindRoleDetailsByName(
                    'Admin'
                )
                const admin_notifiers = await userServices.findRoleNotifiers(
                    adminRole._id
                )
                const notifier_ids = admin_notifiers.map((notifier) => {
                    return notifier._id
                })

                const Meta = {
                    title: `Dealer subscribed `,
                    body: `A dealer subscribed to plan. Visit their profile to view details`,
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

                await notificationService.createNotification(notifications)
                console.log('✅ Admin notifications created')

                return resUtils.sendSuccess(
                    res,
                    200,
                    'Subscription created successfully'
                )
            } else {
                console.log(
                    'ℹ️ Subscription already exists for this transaction'
                )
                return resUtils.sendSuccess(
                    res,
                    200,
                    'Subscription already exists'
                )
            }
        } else {
            console.log('💳 Razorpay payment detected - order_id:', id)

            // This is a transaction_id (Razorpay order_id)
            const order_id = id
            const payment = await paymentService.findPaymentByOrderId(order_id)
            if (!payment) {
                console.log('❌ Payment not found for order_id:', order_id)
                return resUtils.sendError(res, 400, 'Payment not found')
            }

            const planDetails = await planService.findPlanDetails(
                payment.plan_id
            )
            const start_date = Date.now()
            const end_date = addMonths(
                start_date,
                parseInt(planDetails.interval)
            )

            const subscription =
                await subscriptionService.findSubscriptionByTxnId(order_id)

            if (!subscription) {
                console.log('📝 Creating new subscription for Razorpay payment')

                await subscriptionService.createSubscription({
                    plan_id: planDetails._id,
                    user_id: user._id,
                    razorpay_order_id: order_id,
                    start_date: start_date,
                    end_date: end_date,
                    status: 'ACTIVE',
                })

                // payment success Email notification for the user
                const GenerateEmailTemplateArgs = {
                    receivers: [user?.email],
                    content: { user, payment },
                    subject: 'Payment confirmation mail',
                    templatePath: 'core/assets/template/invoice.template.ejs',
                }
                await GenerateEmailTemplate(GenerateEmailTemplateArgs)

                await userServices.updateUserById(user._id, {
                    is_premium: true,
                })

                const adminRole = await roleServices.FindRoleDetailsByName(
                    'Admin'
                )
                const admin_notifiers = await userServices.findRoleNotifiers(
                    adminRole._id
                )
                const notifier_ids = admin_notifiers.map((notifier) => {
                    return notifier._id
                })

                const Meta = {
                    title: `Dealer subscribed `,
                    body: `A dealer subscribed to plan. Visit their profile to view details`,
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

                removeFromArr(PAYMENT_QUEUE, order_id)
                await notificationService.createNotification(notifications)
                console.log('✅ Razorpay subscription created successfully')
            }

            return resUtils.sendSuccess(
                res,
                200,
                'Subscription created successfully'
            )
        }
    } catch (error) {
        console.log('❌ Error in createSubscription:', error)
        return resUtils.sendError(
            res,
            500,
            'Failed to create subscription',
            error
        )
    }
}
const downloadInvoiceController = async (req, res, next) => {
    try {
        const { session_id, payment_id } = req.query
        const user = req.user

        console.log('🔍 Download invoice request:', {
            session_id,
            payment_id,
            userId: user.id,
            userPhone: user.phone,
        })

        let payment
        if (session_id) {
            // If session_id is provided, find payment by that ID
            console.log('🔍 Looking for payment by session_id:', session_id)
            payment = await paymentService.findOne(session_id)
        } else if (payment_id) {
            // If payment_id is provided, find payment by that ID
            console.log('🔍 Looking for payment by payment_id:', payment_id)
            payment = await paymentService.findOne(payment_id)
        } else {
            // If no parameters provided, find the latest successful payment for the current user
            console.log('🔍 Looking for latest payment for user:', user.id)
            const userPayments = await paymentService.getPaymentByUserId(
                user.id,
                1,
                1
            )
            if (userPayments && userPayments.length > 0) {
                payment = userPayments[0]
            }
        }

        if (!payment) {
            console.log('❌ Payment not found')
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
}
export default {
    verifyPayment,
    createPaymentOrder,
    createSubscription,
    webhooks,
    downloadInvoiceController,
}
