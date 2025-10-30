import userServices from 'core/services/user.services'
import Leads from 'core/models/leads' // ✅ adjust path if needed
import variant from 'core/models/variant'
import resUtils from 'core/utils/res.utils'
import {
    generateHashPassword,
    validatePassword,
} from 'core/utils/password.utils'
import { createUserJwt, verifyJwtToken } from 'core/utils/jwt.utils'
import roleServices from 'core/services/role.services'
import planService from 'core/services/plan.service'
import { removeDuplicatesFromArray } from 'core/utils/js.utils'

import { Twilio } from 'twilio'
import otp_WA from 'core/models/otp_WA'
import City from 'core/models/city'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER
const contentSid = process.env.TWILIO_CONTENT_SID
const client = new Twilio(accountSid, authToken)

// Helper function to get city coordinates
const getCityCoordinates = async (cityName) => {
    try {
        const city = await City.findOne({
            name: { $regex: new RegExp(cityName, 'i') },
        })
        if (city && city.location) {
            return {
                latitude: city.location.coordinates[1], // lat is at index 1
                longitude: city.location.coordinates[0], // lng is at index 0
            }
        }
        return null
    } catch (error) {
        console.error('Error fetching city coordinates:', error)
        return null
    }
}

const registerOrVerify = async (req, res) => {
    try {
        const { name, phone, city, otp, latitude, longitude } = req.body

        // Get coordinates - either from request or from city lookup
        let finalLatitude = latitude
        let finalLongitude = longitude

        if (!latitude || !longitude) {
            if (city) {
                const cityCoords = await getCityCoordinates(city)
                if (cityCoords) {
                    finalLatitude = cityCoords.latitude
                    finalLongitude = cityCoords.longitude
                }
            }
        }

        if (!phone) {
            return resUtils.sendError(res, 400, 'Phone number is required')
        }

        const phoneRegex = /^\+\d{7,15}$/ // You can adjust this regex for other countries
        if (!phoneRegex.test(phone)) {
            return resUtils.sendError(res, 400, 'Invalid phone number format', [
                {
                    field: 'phone',
                    message:
                        'Enter a valid phone number with country code (e.g. +919876543210)',
                },
            ])
        }

        // Check for phone number uniqueness across ALL users (including deleted ones)
        const anyExistingUser = await userServices.checkPhoneNumberUniqueness(
            phone
        )

        // Check for active users only (for existing user logic)
        const existingActiveUser = await userServices.checkUser({
            phone,
            deletedAt: null,
        })

        // === STEP 1: Send OTP ===
        if (!otp) {
            if (!name || (!city && (!latitude || !longitude))) {
                return resUtils.sendError(
                    res,
                    400,
                    'Missing required fields: name and either city or coordinates (latitude & longitude)'
                )
            }

            // If there's any active user with this phone, prevent signup
            if (anyExistingUser) {
                return resUtils.sendError(
                    res,
                    400,
                    'Phone number already exists',
                    [
                        {
                            field: 'phone',
                            message:
                                'This phone number is already registered. Please use a different phone number.',
                        },
                    ]
                )
            }

            const now = new Date()
            const twentySecondsAgo = new Date(now.getTime() - 20 * 1000)
            const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

            const recentOtp = await otp_WA.findOne({
                value: phone,
                type: 'registration',
                createdAt: { $gt: twentySecondsAgo },
            })

            if (recentOtp) {
                return resUtils.sendError(
                    res,
                    429,
                    'Wait 20 seconds before requesting OTP again'
                )
            }

            const otpCount = await otp_WA.countDocuments({
                value: phone,
                type: 'registration',
                createdAt: { $gt: tenMinutesAgo },
            })

            if (otpCount >= 10) {
                return resUtils.sendError(res, 429, 'OTP limit reached')
            }

            await otp_WA.updateMany(
                { value: phone, type: 'registration', valid: true },
                { $set: { valid: false } }
            )

            const generatedOtp = Math.floor(
                100000 + Math.random() * 900000
            ).toString()

            const otpData = {
                value: phone,
                otp: generatedOtp,
                type: 'registration',
                valid: true,
                name,
                city,
                ...(finalLatitude &&
                    finalLongitude && {
                        location: {
                            type: 'Point',
                            coordinates: [
                                parseFloat(finalLongitude),
                                parseFloat(finalLatitude),
                            ],
                        },
                    }),
                expiresAt: new Date(Date.now() + 90 * 1000),
            }

            await otp_WA.create(otpData)

            try {
                await client.messages.create({
                    from: `whatsapp:${twilioNumber}`,
                    to: `whatsapp:${phone}`,
                    contentSid: contentSid, // Your approved template SID
                    contentVariables: JSON.stringify({
                        1: generatedOtp, // {{1}} → OTP
                        2: '90', // {{2}} → expiry time
                    }),
                })
            } catch (twilioError) {
                console.error('Twilio Error:', twilioError)
                // Don’t fail request, OTP still valid
            }

            return resUtils.sendSuccess(res, 200, 'OTP sent successfully')
        }

        // === STEP 2: Verify OTP ===
        const latestOtp = await otp_WA
            .findOne({ value: phone, type: 'registration', valid: true })
            .sort({ createdAt: -1 })

        if (!latestOtp) {
            return resUtils.sendError(res, 400, 'OTP not found')
        }

        if (latestOtp.expiresAt < new Date()) {
            latestOtp.valid = false
            await latestOtp.save()
            return resUtils.sendError(res, 400, 'OTP expired')
        }

        if (latestOtp.otp !== otp) {
            return resUtils.sendError(res, 401, 'Invalid OTP')
        }

        latestOtp.valid = false
        await latestOtp.save()

        // Double-check phone uniqueness before creating user
        const finalPhoneCheck = await userServices.checkPhoneNumberUniqueness(
            phone
        )
        if (finalPhoneCheck) {
            return resUtils.sendError(res, 400, 'Phone number already exists', [
                {
                    field: 'phone',
                    message:
                        'This phone number is already registered. Please use a different phone number.',
                },
            ])
        }

        let user = await userServices.checkUser({ phone })

        if (!user) {
            try {
                const userRole = await roleServices.FindRoleDetailsByName(
                    'Dealer'
                )

                user = await userServices.createUser({
                    phone,
                    name: latestOtp.name,
                    city: latestOtp.city,
                    role: userRole?._id,
                    is_verified: true,
                    is_premium: false,
                    ...(latestOtp.location && { location: latestOtp.location }),
                })

                // Notify all admins about new user onboard
                try {
                    const notificationService = (
                        await import('core/services/notification.service')
                    ).default
                    const ParentType = (
                        await import('core/constants/parent_type.constants.js')
                    ).default
                    const EntityTypes = (
                        await import('core/constants/entity_types.constants.js')
                    ).default
                    const adminRole = await roleServices.FindRoleDetailsByName(
                        'Admin'
                    )
                    const admin_notifiers =
                        await userServices.findRoleNotifiers(adminRole._id)
                    const notifier_ids = admin_notifiers.map(
                        (notifier) => notifier._id
                    )
                    const Meta = {
                        title: `New user onboarded`,
                    }
                    const notifications = notifier_ids.map((admin_id) => ({
                        actor: user._id,
                        notifier: admin_id,
                        parent_id: user._id,
                        parent_type: ParentType.User,
                        entity_type: EntityTypes.DEALER_ONBOARD,
                        read: false,
                        meta: Meta,
                        isDeleted: false,
                    }))
                    await notificationService.createNotification(notifications)
                } catch (notifyErr) {
                    console.error(
                        'Failed to send admin notification for new user onboard:',
                        notifyErr
                    )
                }
            } catch (err) {
                console.error('❌ User creation failed:', err)
                return resUtils.sendError(res, 500, 'User creation failed', [
                    { message: err.message, field: 'user' },
                ])
            }
        }

        const { jwtToken, refreshToken } = createUserJwt({
            _id: user._id,
            phone: user.phone,
        })

        req.session = {
            token: jwtToken,
            refreshToken,
        }

        const sanitizedUserData = await userServices.getSanitizedUserData(
            user._id
        )

        return resUtils.sendSuccess(res, 200, 'Registration complete', {
            accessToken: jwtToken,
            refreshToken,
            user: sanitizedUserData,
        })
    } catch (error) {
        console.error('Register/Verify Error:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ])
    }
}

const registerUser = async (req, res) => {
    try {
        const { name, phone, city } = req.body

        if (!phone || !name || !city) {
            return resUtils.sendError(res, 400, 'Missing required fields')
        }

        // Check for phone number uniqueness across ALL users (including deleted ones)
        const anyExistingUser = await userServices.checkPhoneNumberUniqueness(
            phone
        )

        // Check for active users only (for existing user logic)
        const existingUser = await userServices.checkUser({
            phone,
            deletedAt: null,
        })

        // If there's any active user with this phone, prevent registration
        if (anyExistingUser) {
            return resUtils.sendError(res, 400, 'Phone number already exists', [
                {
                    field: 'phone',
                    message:
                        'This phone number is already registered. Please use a different phone number.',
                },
            ])
        }

        if (existingUser && existingUser.is_verified) {
            return resUtils.sendError(res, 400, 'User already exists')
        }

        const now = new Date()
        const twentySecondsAgo = new Date(now.getTime() - 20 * 1000)
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

        const recentOtp = await otp_WA.findOne({
            value: phone,
            type: 'registration',
            createdAt: { $gt: twentySecondsAgo },
        })

        if (recentOtp) {
            return resUtils.sendError(
                res,
                429,
                'Wait 20 seconds before requesting OTP again',
                [
                    {
                        field: 'otp',
                        message: 'Please wait before requesting a new OTP',
                    },
                ]
            )
        }

        const otpCount = await otp_WA.countDocuments({
            value: phone,
            type: 'registration',
            createdAt: { $gt: tenMinutesAgo },
        })

        if (otpCount >= 10) {
            return resUtils.sendError(res, 429, 'OTP limit reached', [
                {
                    field: 'otp',
                    message:
                        'You have reached the maximum OTP requests. Try again later.',
                },
            ])
        }

        await otp_WA.updateMany(
            { value: phone, type: 'registration', valid: true },
            { $set: { valid: false } }
        )

        const otp = '123456' // Hardcoded for testing

        await otp_WA.create({
            value: phone,
            otp,
            type: 'registration',
            valid: true,
            name,
            city,
            expiresAt: new Date(Date.now() + 90 * 1000),
        })

        // Skip Twilio sending for testing
        return resUtils.sendSuccess(
            res,
            200,
            'OTP sent successfully (testing mode, always 123456)'
        )
    } catch (error) {
        console.log('Register Error:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ])
    }
}

const registerVerifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body
        const errors = []

        if (!phone || !otp) {
            errors.push({
                message: 'Phone and OTP are required',
                field: 'phone',
            })
            return resUtils.sendError(res, 400, 'Missing data', errors)
        }

        const latestOtp = await otp_WA
            .findOne({ value: phone, type: 'registration', valid: true })
            .sort({ createdAt: -1 })

        if (!latestOtp) {
            return resUtils.sendError(res, 400, 'OTP not found', [
                { message: 'No OTP sent', field: 'otp' },
            ])
        }

        if (latestOtp.expiresAt < new Date()) {
            latestOtp.valid = false
            await latestOtp.save()
            return resUtils.sendError(res, 400, 'OTP expired', [
                { message: 'OTP expired', field: 'otp' },
            ])
        }

        if (latestOtp.otp !== otp) {
            return resUtils.sendError(res, 401, 'Invalid OTP', [
                { message: 'Invalid OTP', field: 'otp' },
            ])
        }

        latestOtp.valid = false
        await latestOtp.save()

        // Create user if not exists
        let user = await userServices.checkUser({ phone })

        if (!user) {
            const userRole = await roleServices.FindRoleDetailsByName('Dealer')
            user = await userServices.createUser({
                phone,
                name: latestOtp.name,
                city: latestOtp.city,
                email: latestOtp.email,
                role: userRole?._id,
                is_verified: true,
                is_premium: false,
            })
        } else if (!user.is_verified) {
            await userServices.updateUserById(user._id, {
                is_verified: true,
            })
        }

        const { jwtToken, refreshToken } = createUserJwt({
            _id: user._id,
            phone: user.phone,
        })

        req.session = {
            token: jwtToken,
            refreshToken,
        }

        const sanitizedUserData = await userServices.getSanitizedUserData(
            user._id
        )

        return resUtils.sendSuccess(res, 200, 'Registration complete', {
            accessToken: jwtToken,
            refreshToken,
            user: sanitizedUserData,
        })
    } catch (error) {
        console.error('OTP Registration Error:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ])
    }
}

const resetPassword = async (req, res) => {
    try {
        const { password } = req?.body
        const user = req?.user
        
        // Validate user data from middleware
        if (!user || !user._id) {
            return resUtils.sendError(res, 401, 'User authentication required', {
                errors: [
                    {
                        message: 'User authentication required',
                    },
                ],
            })
        }

        // Check if user still exists and is active
        const userExist = await userServices.checkUser({
            _id: user._id,
            deletedAt: null,
        })
        
        if (!userExist) {
            return resUtils.sendError(res, 400, "User doesn't exist", {
                errors: [
                    {
                        message: 'User does not exist',
                    },
                ],
            })
        }

        // Generate new hashed password
        const hashedPassword = await generateHashPassword(password)
        
        // Update user password
        await userServices.changePassword(user._id, hashedPassword)
        
        return resUtils.sendSuccess(res, 200, 'Password updated successfully')
    } catch (error) {
        console.error('Reset password error:', error)
        return resUtils.sendError(res, 500, 'Internal server error')
    }
}

const login = async (req, res) => {
    try {
        const { phone } = req.body

        if (!phone) {
            return resUtils.sendError(res, 400, 'Phone is required', [
                { field: 'phone', message: 'Phone is required' },
            ])
        }

        const phoneRegex = /^\+91\d{10}$/ // Strictly matches Indian numbers like +919876543210
        if (!phoneRegex.test(phone)) {
            return resUtils.sendError(res, 400, 'Invalid phone number format', [
                {
                    field: 'phone',
                    message:
                        'Enter a valid phone number with country code (e.g. +919876543210)',
                },
            ])
        }

        const user = await userServices.checkUser({ phone, deletedAt: null })

        if (!user || !user.is_verified) {
            return resUtils.sendError(
                res,
                400,
                'User not found or not verified',
                [{ field: 'phone', message: 'Phone number not registered' }]
            )
        }

        const now = new Date()
        const twentySecondsAgo = new Date(now.getTime() - 20 * 1000)
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

        // 1. Prevent too frequent OTP resends (1 per 20 seconds)
        const recentOtp = await otp_WA.findOne({
            value: phone,
            type: 'login',
            createdAt: { $gt: twentySecondsAgo },
        })

        if (recentOtp) {
            return resUtils.sendError(res, 429, 'Too Many Requests', [
                {
                    field: 'phone',
                    message:
                        'Please wait 20 seconds before requesting another OTP',
                },
            ])
        }

        // 2. Max 10 OTPs in last 10 mins
        const otpCount = await otp_WA.countDocuments({
            value: phone,
            type: 'login',
            createdAt: { $gt: tenMinutesAgo },
        })

        if (otpCount >= 10) {
            return resUtils.sendError(res, 429, 'Too Many Requests', [
                {
                    field: 'phone',
                    message: 'Too many OTP requests. Try again later.',
                },
            ])
        }

        // 3. Invalidate older OTPs
        await otp_WA.updateMany(
            { value: phone, type: 'login', valid: true },
            { $set: { valid: false } }
        )

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        await otp_WA.create({
            value: phone,
            otp,
            type: 'login',
            valid: true,
            expiresAt: new Date(Date.now() + 90 * 1000),
        })

        try {
            await client.messages.create({
                from: `whatsapp:${twilioNumber}`,
                to: `whatsapp:${phone}`,
                contentSid: contentSid, // Your approved template SID
                contentVariables: JSON.stringify({
                    1: otp, // {{1}} → OTP
                    2: '90', // {{2}} → expiry time
                }),
            })
        } catch (twilioError) {
            console.error('Twilio Error:', twilioError)
            // Don’t fail request, OTP still valid
        }

        return resUtils.sendSuccess(res, 200, 'OTP sent for login')
    } catch (error) {
        console.error('Login OTP Error:', error)
        return resUtils.sendError(res, 500, 'Failed to send OTP', [
            { field: 'system', message: error.message },
        ])
    }
}

const loginVerifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body
        let errors = []

        if (!phone || !otp) {
            errors.push({
                message: 'Phone and OTP are required',
                field: 'phone',
            })
            return resUtils.sendError(res, 400, 'Missing data', errors)
        }

        const latestOtp = await otp_WA
            .findOne({ value: phone, type: 'login', valid: true })
            .sort({ createdAt: -1 })

        if (!latestOtp) {
            return resUtils.sendError(res, 400, 'OTP not found', [
                { message: 'No OTP sent', field: 'otp' },
            ])
        }

        if (latestOtp.expiresAt < new Date()) {
            latestOtp.valid = false
            await latestOtp.save()
            return resUtils.sendError(res, 400, 'OTP expired', [
                { message: 'OTP expired', field: 'otp' },
            ])
        }

        if (latestOtp.otp !== otp) {
            return resUtils.sendError(res, 401, 'Invalid OTP', [
                { message: 'Invalid OTP', field: 'otp' },
            ])
        }

        // Invalidate OTP
        latestOtp.valid = false
        await latestOtp.save()

        // Get user
        const user = await userServices.checkUser({ phone, deletedAt: null })

        if (!user || !user.is_verified) {
            return resUtils.sendError(res, 400, 'User not verified', [
                { message: 'User not found or not verified', field: 'phone' },
            ])
        }

        // Generate JWT
        const { jwtToken, refreshToken } = createUserJwt({
            _id: user._id,
            phone: user.phone,
        })

        req.session = {
            token: jwtToken,
            refreshToken,
        }

        const sanitizedUserData = await userServices.getSanitizedUserData(
            user._id
        )

        return resUtils.sendSuccess(res, 200, 'Login successful', {
            accessToken: jwtToken,
            refreshToken,
            user: sanitizedUserData,
        })
    } catch (error) {
        console.error('OTP Login Error:', error)
        return resUtils.sendError(res, 500, 'Internal error', [
            { message: error.message, field: 'system' },
        ])
    }
}

const updateUserLocation = async (req, res) => {
    try {
        const { latitude, longitude, city } = req.body
        const user = req.user // From auth middleware

        if (!user) {
            return resUtils.sendError(res, 401, 'User not authenticated', [
                { message: 'Authentication required', field: 'auth' },
            ])
        }

        // Get coordinates - prioritize request coordinates, then city lookup
        let finalLatitude = null
        let finalLongitude = null

        console.log('Location update debug:', {
            latitude,
            longitude,
            city,
            userLocation: user?.location,
        })

        // First priority: Use provided coordinates if both are present
        if (latitude && longitude) {
            finalLatitude = parseFloat(latitude)
            finalLongitude = parseFloat(longitude)
            console.log('Using provided coordinates:', {
                finalLatitude,
                finalLongitude,
            })
        }
        // Second priority: Use city lookup if coordinates not provided but city is
        else if (city) {
            const cityCoords = await getCityCoordinates(city)
            if (cityCoords) {
                finalLatitude = cityCoords.latitude
                finalLongitude = cityCoords.longitude
                console.log('Using city coordinates:', {
                    city,
                    finalLatitude,
                    finalLongitude,
                })
            } else {
                console.log('City coordinates not found for:', city)
            }
        }

        // If no valid coordinates found, return error
        if (!finalLatitude || !finalLongitude) {
            return resUtils.sendError(res, 400, 'Location data required', [
                {
                    message:
                        'Please provide either coordinates (latitude & longitude) or city name',
                    field: 'location',
                },
            ])
        }

        // Update user's location
        try {
            await userServices.updateUserById(user.id, {
                location: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(finalLongitude),
                        parseFloat(finalLatitude),
                    ],
                },
            })
            console.log('User location updated successfully')

            // Get updated user data
            const updatedUser = await userServices.getSanitizedUserData(user.id)

            return resUtils.sendSuccess(
                res,
                200,
                'Location updated successfully',
                {
                    user: updatedUser,
                }
            )
        } catch (updateError) {
            console.error('Failed to update user location:', updateError)
            return resUtils.sendError(res, 500, 'Failed to update location', [
                { message: 'Failed to update user location', field: 'system' },
            ])
        }
    } catch (error) {
        console.error('Update Location Error:', error)
        return resUtils.sendError(res, 500, 'Internal error', [
            { message: error.message, field: 'system' },
        ])
    }
}

const regenerateToken = async (req, res) => {
    try {
        const session = req?.session
        const body = req?.body
        const refreshToken = body?.refreshToken || session?.refreshToken
        if (!refreshToken)
            return resUtils.sendError(res, 500, 'No token provided')
        const decodeValue = verifyJwtToken(refreshToken)
        if (typeof decodeValue === 'string')
            return resUtils.sendError(res, 400, 'Invalid token')
        const user = await userServices.getUserByEmail(decodeValue?.email)
        if (!user) return resUtils.sendError(res, 500, 'User not exist')
        const { jwtToken, refreshToken: newRefreshToken } =
            createUserJwt(decodeValue)
        const sessionOptions = {
            token: jwtToken,
            refreshToken: refreshToken,
        }
        req.session = sessionOptions

        return resUtils.sendSuccess(res, 200, 'Token created', {
            jwtToken,
            refreshToken: newRefreshToken,
        })
    } catch (error) {
        console.log(error, 'error at regenrate token')
        return resUtils.sendError(res, 400, 'Internal server error')
    }
}

const logout = async (req, res) => {
    try {
        req.session = {
            refreshToken: '',
            token: '',
        }
        return resUtils.sendSuccess(res, 200, 'Logout successfully')
    } catch (error) {
        resUtils.sendError(res, 400, 'Internal server error')
    }
}

const me = async (req, res) => {
    try {
        console.log('ME function called with req.user:', req.user)
        const { phone } = req.user
        console.log('Looking for user with phone:', phone)

        const user = await userServices.getUserByPhone(phone)
        console.log('User found:', user)

        if (!user) {
            console.log('User not found for phone:', phone)
            return resUtils.sendError(res, 404, 'User not found')
        }

        // Simplified user details without plan service dependency
        const userDetails = {
            id: user?._id,
            email: user?.email,
            name: user?.name,
            is_verified: user?.is_verified,
            is_premium: user?.is_premium || false,
            phone: user?.phone,
            city: user?.city,
            country_code: user?.country_code,
            is_KYC_verified: user?.is_KYC_verified || false,
            premium_types: [],
            plan_types: [],
            role: user?.role
                ? {
                      role: user?.role?.name,
                      type: user?.role?.type,
                  }
                : { role: 'USER', type: 'USER' },
            documents: {
                aadhar_front: {
                    status: user?.documents?.aadhar_front?.status || 'pending',
                    rejectionReason:
                        user?.documents?.aadhar_front?.rejectionReason || '',
                },
                aadhar_back: {
                    status: user?.documents?.aadhar_back?.status || 'pending',
                    rejectionReason:
                        user?.documents?.aadhar_back?.rejectionReason || '',
                },
                photo: {
                    status: user?.documents?.photo?.status || 'pending',
                    rejectionReason:
                        user?.documents?.photo?.rejectionReason || '',
                },
            },
        }

        return resUtils.sendSuccess(res, 200, 'Success', userDetails)
    } catch (error) {
        console.log('Error in ME function:', error)
        return resUtils.sendError(res, 500, 'Internal server error')
    }
}

const getLeadsByUser = async (req, res) => {
    try {
        const userId = req._id // Comes from the authenticated user

        const leads = await Leads.find({ user_id: userId })
            .populate('vehicle.brand_id', 'name') // Optional: populate brand
            .populate('vehicle.model_id', 'name') // Optional: populate model
            .populate('vehicle.variant_id', 'name') // Optional: populate variant
            .populate('fuel_type', 'name') // Optional: if fuelType populated
            .populate('transmission_type', 'name') // Optional: if transmissionType populated
            .sort({ createdAt: -1 })

        const { retrieveFile } = await import('core/utils/storage.utils.js')

        const docFields = [
            'rc',
            'puc',
            'insurance',
            'car_front',
            'car_back',
            'car_left',
            'car_right',
            'car_interior_front',
            'car_frontside_left',
            'car_frontside_right',
            'car_backside_right',
            'car_backside_left',
            'car_interior_back',
            'odometer',
            'service_history',
        ]

        const signedLeads = await Promise.all(
            leads.map(async (lead) => {
                const signedDocs = {}

                for (const field of docFields) {
                    const doc = lead.documents?.[field]
                    if (doc?.s3Key) {
                        signedDocs[field] = {
                            url: retrieveFile.signed(doc.s3Key, 'inline'),
                            contentType: doc.contentType,
                            originalName: doc.originalName,
                        }
                    }
                }

                return {
                    ...lead.toObject(),
                    documents: signedDocs,
                }
            })
        )

        return resUtils.sendSuccess(res, 200, 'User leads fetched', signedLeads)
    } catch (error) {
        console.error('Error fetching user leads:', error)
        return resUtils.sendError(res, 500, 'Internal server error')
    }
}

const sendPhoneUpdateOtp = async (req, res) => {
    try {
        const { newPhone } = req.body
        const currentUser = req.user

        if (!newPhone) {
            return resUtils.sendError(
                res,
                400,
                'New phone number is required',
                [{ field: 'newPhone', message: 'New phone number is required' }]
            )
        }

        // Validate phone number format
        const phoneRegex = /^\+91\d{10}$/ // Strictly matches Indian numbers like +919876543210
        if (!phoneRegex.test(newPhone)) {
            return resUtils.sendError(res, 400, 'Invalid phone number format', [
                {
                    field: 'newPhone',
                    message:
                        'Enter a valid phone number with country code (e.g. +919876543210)',
                },
            ])
        }

        // Check if new phone is same as current phone
        if (newPhone === currentUser.phone) {
            return resUtils.sendError(
                res,
                400,
                'New phone number is same as current phone',
                [
                    {
                        field: 'newPhone',
                        message:
                            'New phone number must be different from current phone',
                    },
                ]
            )
        }

        // Check if new phone number is already registered by another user
        const existingUser = await userServices.checkUser({
            phone: newPhone,
            deletedAt: null,
        })

        // Also check if the phone number exists in ANY user (including deleted ones)
        const anyExistingUser = await userServices.checkPhoneNumberUniqueness(
            newPhone
        )

        // If there's any active user with this phone, prevent phone update
        if (
            anyExistingUser &&
            anyExistingUser._id.toString() !== currentUser.id
        ) {
            return resUtils.sendError(res, 400, 'Phone number already exists', [
                {
                    field: 'newPhone',
                    message:
                        'This phone number is already registered. Please use a different phone number.',
                },
            ])
        }

        if (existingUser && existingUser._id.toString() !== currentUser.id) {
            return resUtils.sendError(
                res,
                400,
                'Phone number already registered',
                [
                    {
                        field: 'newPhone',
                        message:
                            'This phone number is already registered by another user',
                    },
                ]
            )
        }

        const now = new Date()
        const twentySecondsAgo = new Date(now.getTime() - 20 * 1000)
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

        // 1. Prevent too frequent OTP resends (1 per 20 seconds)
        const recentOtp = await otp_WA.findOne({
            value: newPhone,
            type: 'phone_update',
            createdAt: { $gt: twentySecondsAgo },
        })

        if (recentOtp) {
            return resUtils.sendError(res, 429, 'Too Many Requests', [
                {
                    field: 'newPhone',
                    message:
                        'Please wait 20 seconds before requesting another OTP',
                },
            ])
        }

        // 2. Max 10 OTPs in last 10 mins
        const otpCount = await otp_WA.countDocuments({
            value: newPhone,
            type: 'phone_update',
            createdAt: { $gt: tenMinutesAgo },
        })

        if (otpCount >= 10) {
            return resUtils.sendError(res, 429, 'Too Many Requests', [
                {
                    field: 'newPhone',
                    message: 'Too many OTP requests. Try again later.',
                },
            ])
        }

        // 3. Invalidate older OTPs for this phone
        await otp_WA.updateMany(
            { value: newPhone, type: 'phone_update', valid: true },
            { $set: { valid: false } }
        )

        const otp = '123456' // Hardcoded for testing

        await otp_WA.create({
            value: newPhone,
            otp,
            type: 'phone_update',
            valid: true,
            currentUserId: currentUser.id, // Store current user ID for verification
            expiresAt: new Date(Date.now() + 90 * 1000),
        })

        // Skip Twilio sending for testing
        return resUtils.sendSuccess(
            res,
            200,
            'OTP sent for phone number update (testing mode, always 123456)'
        )
    } catch (error) {
        console.error('Send Phone Update OTP Error:', error)
        return resUtils.sendError(res, 500, 'Failed to send OTP', [
            { field: 'system', message: error.message },
        ])
    }
}

const verifyPhoneUpdateOtp = async (req, res) => {
    try {
        const { newPhone, otp } = req.body
        const currentUser = req.user

        if (!newPhone || !otp) {
            return resUtils.sendError(
                res,
                400,
                'New phone number and OTP are required',
                [
                    {
                        field: 'newPhone',
                        message: 'New phone number and OTP are required',
                    },
                ]
            )
        }

        // Validate phone number format
        const phoneRegex = /^\+91\d{10}$/
        if (!phoneRegex.test(newPhone)) {
            return resUtils.sendError(res, 400, 'Invalid phone number format', [
                {
                    field: 'newPhone',
                    message:
                        'Enter a valid phone number with country code (e.g. +919876543210)',
                },
            ])
        }

        // Find the OTP for phone update
        const latestOtp = await otp_WA
            .findOne({
                value: newPhone,
                type: 'phone_update',
                valid: true,
                currentUserId: currentUser.id,
            })
            .sort({ createdAt: -1 })

        if (!latestOtp) {
            return resUtils.sendError(res, 400, 'OTP not found', [
                { message: 'No OTP sent for this phone number', field: 'otp' },
            ])
        }

        if (latestOtp.expiresAt < new Date()) {
            latestOtp.valid = false
            await latestOtp.save()
            return resUtils.sendError(res, 400, 'OTP expired', [
                { message: 'OTP expired', field: 'otp' },
            ])
        }

        if (latestOtp.otp !== otp) {
            return resUtils.sendError(res, 401, 'Invalid OTP', [
                { message: 'Invalid OTP', field: 'otp' },
            ])
        }

        // Invalidate OTP
        latestOtp.valid = false
        await latestOtp.save()

        // Double-check that the phone number is still available before updating
        const existingUser = await userServices.checkUser({
            phone: newPhone,
            deletedAt: null,
        })

        // Also check if the phone number exists in ANY user (including deleted ones)
        const anyExistingUser = await userServices.checkPhoneNumberUniqueness(
            newPhone
        )

        // If there's any user with this phone (including deleted ones), prevent phone update
        if (
            anyExistingUser &&
            anyExistingUser._id.toString() !== currentUser.id
        ) {
            return resUtils.sendError(res, 400, 'Phone number already exists', [
                {
                    field: 'newPhone',
                    message:
                        'This phone number is already registered. Please use a different phone number.',
                },
            ])
        }

        if (existingUser && existingUser._id.toString() !== currentUser.id) {
            return resUtils.sendError(
                res,
                400,
                'Phone number already registered',
                [
                    {
                        field: 'newPhone',
                        message:
                            'This phone number is already registered by another user',
                    },
                ]
            )
        }

        // Update user's phone number
        try {
            await userServices.updateUserById(currentUser.id, {
                phone: newPhone,
            })

            // Get updated user data
            const updatedUser = await userServices.getSanitizedUserData(
                currentUser.id
            )

            return resUtils.sendSuccess(
                res,
                200,
                'Phone number updated successfully',
                {
                    user: updatedUser,
                }
            )
        } catch (updateError) {
            console.error('Failed to update phone number:', updateError)

            // Check if it's a duplicate key error
            if (updateError.code === 11000 && updateError.keyPattern?.phone) {
                return resUtils.sendError(
                    res,
                    400,
                    'Phone number already registered',
                    [
                        {
                            field: 'newPhone',
                            message:
                                'This phone number is already registered by another user',
                        },
                    ]
                )
            }

            return resUtils.sendError(
                res,
                500,
                'Failed to update phone number',
                [{ message: 'Failed to update phone number', field: 'system' }]
            )
        }
    } catch (error) {
        console.error('Verify Phone Update OTP Error:', error)
        return resUtils.sendError(res, 500, 'Internal error', [
            { message: error.message, field: 'system' },
        ])
    }
}

export default {
    registerOrVerify,
    registerUser,
    registerVerifyOtp,
    resetPassword,
    login,
    loginVerifyOtp,
    updateUserLocation,
    regenerateToken,
    logout,
    me,
    getLeadsByUser,
    sendPhoneUpdateOtp,
    verifyPhoneUpdateOtp,
}
