import countriesServices from 'core/services/countries.services'
import resUtils from 'core/utils/res.utils'

const getCountries = async (req, res, next) => {
    try {
        const response = await countriesServices.getAllCountries()

        return resUtils.sendSuccess(
            res,
            200,
            'countries fetched successfully',
            response
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export default {
    getCountries,
}
