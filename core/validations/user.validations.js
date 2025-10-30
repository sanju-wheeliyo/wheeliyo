import { check } from 'express-validator'
import defaultValidator from './validator'
import userServices from 'core/services/user.services'

const passwordValidationError =
    'Password should be 8 to 15 characters with at least one special character, one numeric, one small case and one upper case letter'
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,15}$/
export const createUserValidator = defaultValidator.initValidation([
    check('name').notEmpty().withMessage('Name is required'),
    check('phone')
        .notEmpty()
        .withMessage('Mobile number is required')
        .isLength({ min: 10, max: 15 })
        .withMessage('Invalid mobile number'),
    check('city')
        .custom((value, { req }) => {
            // Either city OR (latitude AND longitude) must be provided
            const { latitude, longitude } = req.body;
            if (!value && (!latitude || !longitude)) {
                throw new Error('Either city or latitude and longitude coordinates are required');
            }
            return true;
        })
        .withMessage('Either city or latitude and longitude coordinates are required'),
    check('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be a valid number between -90 and 90'),
    check('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be a valid number between -180 and 180'),
])

export const resetPasswordValidator = defaultValidator.initValidation([
    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .matches(passwordRegex)
        .withMessage(passwordValidationError)
        .custom((value, { req }) => {
            if (value == req.body.confirm_password) return true
            return Promise.reject()
        })
        .withMessage('Both password and confirm password must be same')
        .custom(async (value, { req }) => {
            const currentUser = req.user

            const user = await userServices.getUserById(currentUser?._id)

            if (!user) {
                throw new Error('user not found')
            }
        })
        .withMessage('Account does not exist'),
    check('confirm_password')
        .notEmpty()
        .withMessage('Confirm password is required'),
])

export const loginRequestValidator = defaultValidator.initValidation([
  check('phone')
      .notEmpty()
      .withMessage('Phone is required')
      .matches(/^\+\d{10,15}$/)
      .withMessage('Enter a valid phone number with country code'),
])

export const loginValidator = defaultValidator.initValidation([
    check('phone')
        .notEmpty()
        .withMessage('Phone is required')
        .matches(/^\+\d{10,15}$/)
        .withMessage('Enter a valid phone number with country code'),

    check('otp')
        .notEmpty()
        .withMessage('OTP is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits'),
])

export const paymentAddressValidator = defaultValidator.initValidation([
    check('city').notEmpty().withMessage('City is required'),
    check('country').notEmpty().withMessage('Country is required'),
    check('line_1').notEmpty().withMessage('Address line-1 is required'),
    check('line_2').notEmpty().withMessage('Address line-2 is required'),
    check('postal_code').notEmpty().withMessage('Postal code is required'),
    check('state').notEmpty().withMessage('State is required'),
])
