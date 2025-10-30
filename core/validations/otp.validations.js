import { check } from 'express-validator'
import defaultValidator from './validator'

export const sendOtpValidator = defaultValidator.initValidation([
    check('type').notEmpty().withMessage('type is required'),
    check('value').notEmpty().withMessage('value is required'),
])

export const verifyOtpValidator = defaultValidator.initValidation([
    check('type').notEmpty().withMessage('type is required'),
    check('value').notEmpty().withMessage('value is required'),
    check('otp').notEmpty().withMessage('otp is required'),
])
export default sendOtpValidator
