import { check } from 'express-validator'
import defaultValidator from './validator'

const createLead = defaultValidator.initValidation([
    check('name')
        .notEmpty()
        .withMessage('name required')
        .isLength({ min: 4 })
        .withMessage('Invalid name'),
    check('mobile')
        .notEmpty()
        .withMessage('mobile required')
        .isLength({ min: 10, max: 10 })
        .isMobilePhone()
        .withMessage('Invalid mobile number'),
    // check('carNumber')
    //     .notEmpty()
    //     .withMessage('carNumber required')
    //     .matches(/^[A-Z]{2}[0-9]{2}[A-HJ-NP-Z]{1,2}[0-9]{4}$/)
    //     .withMessage('Invalid registration number'),
    check('carBrand').notEmpty().withMessage('carBrand required'),
    check('carYear').notEmpty().withMessage('carYear required'),
    check('carModel').notEmpty().withMessage('carModel required'),
    check('carVariant').notEmpty().withMessage('carVariant required'),
    check('carState').notEmpty().withMessage('carState required'),
    check('carKmDriven').notEmpty().withMessage('carKmDriven required'),
])
const kylasValidation = {
    createLead,
}
export default kylasValidation
