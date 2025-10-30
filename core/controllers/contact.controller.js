import contactServices from 'core/services/contact.services'
import resUtils from 'core/utils/res.utils'

const getQueries = async (req, res, next) => {
    try {
        const { search, page, size } = req.query
        const pageNumber = parseInt(page) || 1
        const pageSize = parseInt(size) || 10
        // const cities = await contactServices.getAllCities()
        const { data, count } = await contactServices.getAllQueriesFilterBy(
            search,
            pageNumber,
            pageSize
        )
        const totalPages = Math.ceil(count / pageSize)
        const meta = {
            page: pageNumber,
            size: pageSize,
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(
            res,
            200,
            'Queries fetched successfully',
            data,
            meta
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const postQuery = async (req, res, next) => {
    try {
        const body = req.body
        const { first_name, last_name, email, phone, query_type, message } =
            body

        const data = {
            first_name,
            last_name,
            email,
            phone,
            query_type,
            message,
        }

        const response = await contactServices.postAQuery(data)
        resUtils.sendSuccess(res, 200, 'Queries posted successfully', response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const deleteQuery = async (req, res, next) => {
    try {
        const { id } = req.query

        const response = await contactServices.deleteAQuery(id)
        resUtils.sendSuccess(res, 200, 'Query deleted successfully', response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export default {
    getQueries,
    postQuery,
    deleteQuery,
}
