import { check } from 'express-validator'
import mongoose from 'mongoose'
import defaultValidator from './validator'

const listModels = defaultValidator.initValidation([
    check("make_id")
        .notEmpty()
        .withMessage("make_id required")
        .custom((value, { req }) => {
            return mongoose.isValidObjectId(value)
        })
        .withMessage("make_id should be valid objectId")
])
const listVariants = defaultValidator.initValidation([
    check("model_id")
        .notEmpty()
        .withMessage("model_id required")
        .custom((value, {req}) => {
            return mongoose.isValidObjectId(value)
        })
        .withMessage("mode_id should be valid objectId")
])

const carValidations = {
    listModels,
    listVariants
}
export default carValidations;