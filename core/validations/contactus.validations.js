import { check } from 'express-validator'
import defaultValidator from './validator'

export const postAQueryValdations = defaultValidator.initValidation([
    check('first_name').notEmpty().withMessage('First name is required'),
    check('last_name').notEmpty().withMessage('Last name is required'),
    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('phone')
        .notEmpty()
        .withMessage('Please enter your mobile number.')
        .matches(/^\+\d{2}\d{10}$/)
        .withMessage(
            'Enter a valid mobile number in the format: +CountryCode MobileNumber. For example, +9190000XXXXX.'
        ),
    check('query_type').notEmpty().withMessage('Subject is required'),
    check('message').notEmpty().withMessage('Message is required'),
])
