import handler from 'core/config/nextConnect.config'
import authController from 'core/controllers/auth.controller'
import otpController from 'core/controllers/otp.controller'
import {
    createUserValidator,
    resetPasswordValidator,
    loginValidator,
    loginRequestValidator,
} from 'core/validations/user.validations'
import {
    sendOtpValidator,
    verifyOtpValidator,
} from 'core/validations/otp.validations'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const apiHandler = handler()

// Auth Routes

apiHandler.post(
    '/api/auth/register_or_verify',
    createUserValidator,
    authController.registerOrVerify
)

apiHandler.post(
    '/api/auth/register_verify_otp',
    verifyOtpValidator,
    authController.registerVerifyOtp
)

apiHandler.post('/api/auth/send_otp', sendOtpValidator, otpController.sendOtp)
apiHandler.post(
    '/api/auth/verify_otp',
    verifyOtpValidator,
    otpController.verifyOtp
)
apiHandler.post(
    '/api/auth/reset_password',
    authenticateTokenMiddleware,
    resetPasswordValidator,
    authController.resetPassword
)
apiHandler.post('/api/auth/login', loginRequestValidator, authController.login)
apiHandler.post(
    '/api/auth/login_verify_otp',
    loginValidator,
    authController.loginVerifyOtp
)
apiHandler.post('/api/auth/regenerate_token', authController.regenerateToken)
apiHandler.post(
    '/api/auth/logout',
    authenticateTokenMiddleware,
    authController.logout
)
apiHandler.get('/api/auth/me', authenticateTokenMiddleware, authController.me)
apiHandler.get(
    '/api/auth/myLeads',
    authenticateTokenMiddleware,
    authController.getLeadsByUser
)

apiHandler.post(
    '/api/auth/update_location',
    authenticateTokenMiddleware,
    authController.updateUserLocation
)

export default apiHandler
