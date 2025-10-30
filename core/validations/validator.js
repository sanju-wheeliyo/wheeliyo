import resUtils from 'core/utils/res.utils'
import { validationResult } from 'express-validator'
import nextConnect from 'next-connect'

const initValidation = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)))
        const errors = validationResult(req)
        if (errors.isEmpty()) return next()
        let errorArray = []
        errors.array().forEach((error) => {
            errorArray.push({
                message: error.msg,
                field: error.param,
            })
        })
        resUtils.sendError(res, 400, 'Validation error', errorArray)
    }
}
export const post = (middleware) => nextConnect().post(middleware)
export const get = (middleware) => nextConnect().get(middleware)
export const del = (middleware) => nextConnect().delete(middleware)
export const put = (middleware) => nextConnect().put(middleware)
const defaultValidator = {
    initValidation,
}
export default defaultValidator
