import paymentService from 'core/services/payment.service'
import planService from 'core/services/plan.service'
import userServices from 'core/services/user.services'
import subscriptionService from 'core/services/subscription.service'
import resUtils from 'core/utils/res.utils'
import {
    STRIPE_SECRET_KEY,
    WEBHOOK_SECRET_KEY,
} from 'core/constants/env.constants'
import { buffer } from 'micro'
import { GenerateEmailTemplate } from 'core/utils/sendMail.util'
const stripe = require('stripe')(STRIPE_SECRET_KEY)
import {
    createStripeCheckoutSession,
    createCustomer,
    retrieveSessionStatus,
} from 'core/utils/stripe.utlis'
import invoiceUtils from 'core/utils/invoice.utils'
import roleServices from 'core/services/role.services'
import ParentType from 'core/constants/parent_type.constants'
import EntityTypes from 'core/constants/entity_types.constants'
import notificationService from 'core/services/notification.service'
import logs from 'core/models/logs'

const CreateCheckoutSession = async (req, res, next) => {
    try {
        const user = req?.user
        const { plan_id, returnUrl } = req.body

        const userDetails = await userServices.getUserById(user?._id)
        const plan = await planService.findPlanDetails(plan_id)
        const stripeResponse = await createStripeCheckoutSession(
            plan?.stripe_price_id,
            userDetails?.stripe_customer_id,
            returnUrl
        )
        const createdDate = new Date(stripeResponse.created * 1000) // Multiply by 1000 to convert seconds to milliseconds

        await paymentService.createPayment({
            payment_status: 'PENDING',
            stripe_payment_id: stripeResponse.id,
            user_id: user._id,
            plan_id: plan_id,
            amount_total: (stripeResponse.amount_total || 0) / 100,
            currency: stripeResponse.currency,
            customer_id: stripeResponse.customer,
            customer_details: stripeResponse.customer_details,
            payment_mode: stripeResponse.mode,
            payment_date: createdDate,
        })

        return resUtils.sendSuccess(res, 200, 'success', {
            checkoutUrl: stripeResponse.url,
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const createStripeCustomer = async (req, res, next) => {
    try {
        const address = req.body
        const user = req?.user
        const customer_details = {
            name: user.name,
            email: user.email,
            address: {
                country: address.country,
                state: address.state,
                city: address.city,
                postal_code: address.postal_code,
                line1: address.line_1,
                line2: address.line_2,
            },
        }
        const customer = await createCustomer(customer_details)
        await userServices.updateUserById(user._id, {
            stripe_customer_id: customer?.id,
        })
        return resUtils.sendSuccess(
            res,
            200,
            'Payment address added successfully'
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const webhooks = async (req, res) => {
    try {
        const payload = req.body
        const payloadString = JSON.stringify(payload, null, 2)
        const secret = WEBHOOK_SECRET_KEY

        const header = stripe.webhooks.generateTestHeaderString({
            payload: payloadString,
            secret,
        })

        let event = stripe.webhooks.constructEvent(
            payloadString,
            header,
            secret
        )
        // Handle the event
        let data
        let Meta
        let notification
        const eventDataObject = event?.data?.object
        const webhhokEvent = {
            event_type: event?.type,
            id: eventDataObject?.id,
            type: eventDataObject?.object,
            customer_id: eventDataObject?.customer,
            billing_reason: eventDataObject?.billing_reason,
            meta: eventDataObject,
        }
        await logs.create(webhhokEvent)
        switch (event.type) {
            case 'invoice.payment_succeeded':
                const invoiceData = event.data.object
                if (invoiceData.billing_reason === 'subscription_cycle') {
                    await subscriptionService.renewSubscription(invoiceData)
                }
                break
            case 'invoice.payment_failed':
                const invoice = event.data.object
                if (invoiceData.billing_reason === 'subscription_cycle') {
                    const subscription_id = invoice.lines.data[0].subscription
                    const subscriptionDetails =
                        await subscriptionService.findOne(subscription_id)
                    await subscriptionService.stopSubscription(invoice)
                    Meta = {
                        title: `Plan expired `,
                        body: `Your Dealer Premium plan expired. Please update your plan  `,
                    }
                    notification = {
                        actor: null,
                        notifier: subscriptionDetails.user_id,
                        parent_id: data.id,
                        parent_type: ParentType.SUBSCRIPTION,
                        entity_type: EntityTypes.PLAN_EXPIRED,
                        read: false,
                        meta: Meta,
                        isDeleted: false,
                    }
                    await notificationService.createNotification(notification)
                    break
                }
            case 'customer.subscription.updated':
                data = event.data.object
                if (data.cancel_at) {
                    const cancelAtDate = new Date(data.cancel_at * 1000)
                    const updateData = {
                        cancel_at_period_end: true,
                        cancel_at_date: cancelAtDate,
                        next_billing_date: null,
                    }
                    const updated =
                        await subscriptionService.updateSubscription(
                            data.id,
                            updateData
                        )
                }
                break
            case 'customer.subscription.deleted':
                data = event.data.object
                await subscriptionService.handleCancelSubscription(data)
                Meta = {
                    title: `Plan expired `,
                    body: `Your Dealer Premium plan expired. Please update your plan  `,
                }
                notification = {
                    actor: null,
                    notifier: subscription.user_id,
                    parent_id: data.id,
                    parent_type: ParentType.SUBSCRIPTION,
                    entity_type: EntityTypes.PLAN_EXPIRED,
                    read: false,
                    meta: Meta,
                    isDeleted: false,
                }
                await notificationService.createNotification(notification)
                break

            case 'invoice.upcoming':
                data = event.data.object
                const subscriptionDetails = await subscriptionService.findOne(
                    data.id
                )

                Meta = {
                    title: `Plan expiring soon `,
                    body: `Your Dealer Premium plan expiring soon. Please update your plan`,
                }
                notification = {
                    actor: null,
                    notifier: subscriptionDetails.user_id,
                    parent_id: data.id,
                    parent_type: ParentType.SUBSCRIPTION,
                    entity_type: EntityTypes.PLAN_EXPIRING_SOON,
                    read: false,
                    meta: Meta,
                    isDeleted: false,
                }

                await notificationService.createNotification(notification)
                break

            default:
                console.log(`Unhandled event type ${event.type}`)
        }

        // Return a response to acknowledge receipt of the event
        return resUtils.sendSuccess(res, 200, { received: true })
    } catch (error) {
        console.log(error, 'ee')
    }
}
const PAYMENT_QUEUE = []
const checkCheckoutStatus = async (req, res, next) => {
    try {
        const { id } = req.query
        const user = req.user
        const session = await retrieveSessionStatus(id)
        const payment = await paymentService.findOne(id)

        if (payment.payment_status !== 'PENDING') {
            return resUtils.sendSuccess(
                res,
                200,
                'Payment data fetched succesfully',
                {
                    status: payment?.payment_status,
                }
            )
        }
        if (session.status !== 'complete') {
            //payment failed
            await paymentService.updatePaymentById(id, {
                payment_status: 'FAILED',
            })
            await subscriptionService.updateSubscription(id, {
                status: 'FAILED',
            })

            return resUtils.sendError(res, 200, 'Payment failed', {
                status: 'failed',
            })
        }
        //payment success
        await paymentService.updatePaymentById(id, {
            payment_status: 'SUCCESS',
        })

        // payment success Email notification for the user
        const GenerateEmailTemplateArgs = {
            receivers: [user?.email],
            content: { user, session },
            subject: 'Payment confirmation mail',
            templatePath: 'core/assets/template/invoice.template.ejs',
        }
        await GenerateEmailTemplate(GenerateEmailTemplateArgs)
        const createdDate = new Date(session.created * 1000) // Multiply by 1000 to convert seconds to milliseconds
        const expiresAtDate = new Date(session.expires_at * 1000)
        const created = await subscriptionService.createSubscription({
            plan_id: payment.plan_id,
            user_id: user._id,
            stripe_subscription_id: session.subscription,
            start_date: createdDate,
            end_date: expiresAtDate,
            next_billing_date: expiresAtDate,
            status: 'ACTIVE',
            payment_method: session.payment_method_types[0],
        })
        const updated = await userServices.updateUserById(user._id, {
            is_premium: true,
        })

        resUtils.sendSuccess(res, 200, 'Payment completed succesfully', {
            status: 'SUCCESS',
        })
        const adminRole = await roleServices.FindRoleDetailsByName('Admin')
        const admin_notifiers = await userServices.findRoleNotifiers(
            adminRole._id
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

        await notificationService.createNotification(notifications)
    } catch (error) {
        console.log(error, 'EEE')
        next(error)
    }
}
const getAllInvoices = async (req, res, next) => {
    try {
        const { page, size, search } = req.query

        const pageNumber = parseInt(page) || 1
        const pageSize = parseInt(size) || 10
        const { data, count } = await paymentService.getAllpayments(
            pageNumber,
            pageSize,
            search
        )
        const totalPages = Math.ceil(count / pageSize)
        const meta = {
            page: pageNumber,
            size: pageSize,
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(
            res,
            200,
            'Invoices fetched succesfully',
            data,
            meta
        )
    } catch (error) {
        next(error)
    }
}
const downloadInvoiceController = async (req, res, next) => {
    try {
        const { session_id } = req.query
        const user = req.user
        const sessionDetails = await retrieveSessionStatus(session_id)
        if (!sessionDetails)
            return resUtils.sendError(res, 500, "Payment details doesn't exist")
        const params = {
            user,
            session: sessionDetails,
            websiteLink: process.env.NEXT_PUBLIC_WEB_URL,
        }
        await invoiceUtils.createAndSendPdf(
            `invoice_${params.id}`,
            res,
            params,
            'core/assets/template/test.template.ejs'
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const getAllInvoicesOfUser = async (req, res, next) => {
    try {
        const userId = req.query.id
        const { page, size } = req.query

        const pageNumber = parseInt(page) || 1
        const pageSize = parseInt(size) || 10
        const { data, count } = await paymentService.getPaymentByUserId(
            userId,
            pageNumber,
            pageSize
        )
        const totalPages = Math.ceil(count || 0 / pageSize)
        const meta = {
            page,
            size: size,
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(res, 200, 'success', data, meta)
    } catch (error) {
        next(error)
    }
}
const getMyInvoices = async (req, res, next) => {
    try {
        const user = req.user
        const { page, size } = req.query
        console.log('getMyInvoices called for user:', user.id)
        
        const { data, count } = await paymentService.getPaymentByUserId(
            user.id,
            page,
            size
        )
        
        console.log('Invoices found:', data, 'Count:', count)

        const totalPages = Math.ceil(count || 0 / size)

        const meta = {
            page,
            size: size,
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(res, 200, 'success', data, meta)
    } catch (error) {
        console.log('error::', error)

        next(error)
    }
}
export default {
    CreateCheckoutSession,
    createStripeCustomer,
    webhooks,
    checkCheckoutStatus,
    getAllInvoices,
    downloadInvoiceController,
    getAllInvoicesOfUser,
    getMyInvoices,
}
