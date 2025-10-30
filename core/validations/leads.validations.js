import { check, body } from 'express-validator'
import defaultValidator from './validator'

export const createLeadsValidator = defaultValidator.initValidation([
    check('owner').notEmpty().withMessage('Owner details required'),
    check('owner.name').notEmpty().withMessage('Owner name is required'),
    check('owner.contact')
        .notEmpty()
        .withMessage('Owner contact detail is required'),
    check('vehicle').notEmpty().withMessage('Vehicle details required'),
    check('vehicle.number')
        .notEmpty()
        .withMessage('Vehicle number is required'),
    check('vehicle.brand').notEmpty().withMessage('Vehicle brand is required'),
    check('vehicle.model').notEmpty().withMessage('Vehicle model is required'),
    check('vehicle.number')
        .notEmpty()
        .withMessage('Vehicle number is required'),
    check('vehicle.variant')
        .notEmpty()
        .withMessage('Vehicle variant is required'),
    check('vehicle.year_of_manufacture')
        .notEmpty()
        .withMessage('year of manufacture is required'),
    check('vehicle.registered_state')
        .notEmpty()
        .withMessage('Registered state is required'),
    check('vehicle.kilometers')
        .notEmpty()
        .withMessage('Kilometers is required'),
    check('car_type')
        .notEmpty()
        .withMessage('Car type  is required')
        .isIn(['pre-owned', 'auction'])
        .withMessage('Car type  is should be either auction or pre-owned'),
])

export const createLeadsByAdminValidator = defaultValidator.initValidation([
    check('owner').notEmpty().withMessage('Owner details required'),
    check('owner.name').notEmpty().withMessage('Owner name is required'),
    check('owner.contact')
        .notEmpty()
        .withMessage('Owner contact detail is required'),
    check('vehicle').notEmpty().withMessage('Vehicle details required'),
    check('vehicle.number')
        .notEmpty()
        .withMessage('Vehicle number is required'),
    check('vehicle.brand').notEmpty().withMessage('Vehicle brand is required'),
    check('vehicle.model').notEmpty().withMessage('Vehicle model is required'),
    check('vehicle.number')
        .notEmpty()
        .withMessage('Vehicle number is required'),
    check('vehicle.variant')
        .notEmpty()
        .withMessage('Vehicle variant is required'),
    check('vehicle.year_of_manufacture')
        .notEmpty()
        .withMessage('year of manufacture is required'),
    check('vehicle.registered_state')
        .notEmpty()
        .withMessage('Registered state is required'),
    check('vehicle.kilometers')
        .notEmpty()
        .withMessage('Kilometers is required'),
    check('car_type')
        .notEmpty()
        .withMessage('Car type  is required')
        .isIn(['pre-owned', 'auction'])
        .withMessage('Car type  is should be either auction or pre-owned'),
    body('car_type').custom((value, { req }) => {
        if (value === 'auction') {
            if (!req.body.auction_details) {
                throw new Error(
                    'Auction details are required for auction car type'
                )
            }
            const {
                bank_name,
                start_date,
                end_date,
                location,
                emd_amount,
                emd_date,
                reserve_price,
                inspection_date,
            } = req.body.auction_details

            if (!bank_name) throw new Error('Bank name is required')
            if (!start_date)
                throw new Error('Start date of auction is required')
            if (!end_date) throw new Error('End date of auction is required')
            if (!location) throw new Error('Location of auction is required')
            if (!emd_amount) throw new Error('EMD amount is required')
            if (!emd_date) throw new Error('EMD date is required')
            if (!reserve_price) throw new Error('Reserve price is required')
            if (!inspection_date) throw new Error('Inspection date is required')
        }
        return true
    }),
])
