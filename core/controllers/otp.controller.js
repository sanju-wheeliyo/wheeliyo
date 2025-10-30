import otpService from 'core/services/otp.services'
import userServices from 'core/services/user.services'
import otpGenerator from 'otp-generator'
import resUtils from 'core/utils/res.utils'
import { createUserJwt } from 'core/utils/jwt.utils'
import { GenerateEmailTemplate } from 'core/utils/sendMail.util'
import roleServices from 'core/services/role.services'
import notificationService from 'core/services/notification.service'
import ParentType from 'core/constants/parent_type.constants'
import EntityTypes from 'core/constants/entity_types.constants'
import { createCustomer } from 'core/utils/razorpay.utils'

const sendOtp = async (req, res) => {
    try {
        const { type, value, is_forget_password } = req.body
        const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        const user = await userServices.getUserByEmail(value)

        if (is_forget_password) {
            if (!user)
                return resUtils.sendError(res, 400, 'Invalid email', [
                    {
                        message: 'Invalid email',
                        field: 'email',
                    },
                ])
        }
        const otpPayload = { type, value, otp }
        await otpService.makePastOtpsInvalid(value)
        await otpService.creatOtp(otpPayload)
        if (type === 'email') {
            let emailOtp = otp.split('')

            const GenerateEmailTemplateArgs = {
                receivers: [value],
                content: emailOtp,
                subject: 'OTP VERIFICATION',
                templatePath: 'core/assets/template/otp.template.ejs',
                websiteLink: process.env.NEXT_PUBLIC_WEB_URL,
                user_name: user?.name || 'User',
            }

            await GenerateEmailTemplate(GenerateEmailTemplateArgs) //send otp through email
        }

        return resUtils.sendSuccess(res, 200, 'OTP send successfully')
    } catch (error) {
        console.log(error)
    }
}
export const verifyOtp = async (req, res, next) => {
    try {
        const { type, value, otp, is_forget_password } = req.body

        let user
        if (type === 'email') {
            user = await userServices.getUserByEmail(value)
        }

        if (type === 'phone') {
            user = await userServices.getUserByPhone(value)
        }

        if (!user)
            return resUtils.sendError(res, 400, 'User not exist ', [
                {
                    message: 'User not exist',
                    field: 'otp',
                },
            ])
        // if (!is_forget_password) {
        //     if (user?.is_verified)
        //         return resUtils.sendError(res, 400, 'User already verified', {
        //             errors: [
        //                 {
        //                     message: 'User Already verified',
        //                 },
        //             ],
        //         })
        // }

        let userOtp
        if (type === 'email') {
            userOtp = await otpService.getOtpByEmail(value)
        }
        if (!userOtp)
            return resUtils.sendError(res, 400, 'OTP expired', [
                {
                    message: 'OTP Expired',
                    field: 'otp',
                },
            ])

        if (userOtp?.otp !== otp)
            return resUtils.sendError(res, 400, 'OTP is not valid', [
                {
                    message: 'OTP is not valid',
                    field: 'otp',
                },
            ])

        if (!is_forget_password) {
            if (type === 'email') await userServices.verifyUser(user)

            user = await userServices.getUserByEmail(value)
        }
        user = await userServices.getUserByEmail(value)
        const createUserJWTOptions = {
            _id: user?._id,
            email: user?.email,
        }
        const { jwtToken, refreshToken } = createUserJwt(createUserJWTOptions)
        const sessionOptions = {
            token: jwtToken,
            refreshToken: refreshToken,
        }
        req.session = sessionOptions
        const sanitizedUserData = await userServices.getSanitizedUserData(
            user?._id
        )

        resUtils.sendSuccess(res, 200, 'OTP verified successfully', {
            accessToken: jwtToken,
            refreshToken,
            user: sanitizedUserData,
        })
        const customer_details = {
            name: user?.name,
            email: user?.email,
            fail_existing: 0,
            contact: `${user?.country_code}+${user?.phone}`,
        }
        const customer = await createCustomer(customer_details)
        await userServices.updateUserById(user._id, {
            razorpay_customer_id: customer?.id,
        })

        const adminRole = await roleServices.FindRoleDetailsByName('Admin')
        const admin_notifiers = await userServices.findRoleNotifiers(
            adminRole._id
        )
        const notifier_ids = admin_notifiers.map((notifier) => {
            return notifier._id
        })

        const Meta = {
            title: `New dealer onboarded`,
            body: `New dealer requires your approval. Visit dealer list and  profile to review and approve.`,
        }
        const notifications = []
        for (const admin_id of notifier_ids) {
            const notification = {
                actor: user._id,
                notifier: admin_id,
                parent_id: user._id,
                parent_type: ParentType.User,
                entity_type: EntityTypes.DEALER_ONBOARD,
                read: false,
                meta: Meta,
                isDeleted: false,
            }
            notifications.push(notification)
        }

        await notificationService.createNotification(notifications)
    } catch (error) {
        console.log(error)
        next(error)
    }
}
export default { sendOtp, verifyOtp }
