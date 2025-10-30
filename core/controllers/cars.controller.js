import makeService from 'core/services/make.services'
import modelService from 'core/services/model.services'
import variantServices from 'core/services/variant.services'
import resUtils from 'core/utils/res.utils'

const listMakes = async (req, res) => {
    try {
        const { type = 'popular', limit } = req.query

        let brands =
            type === 'popular'
                ? await makeService.listPopularBrands(limit)
                : type === 'more'
                ? await makeService.listMoreBrands(limit)
                : await makeService.listAllBrands()

        resUtils.sendSuccess(res, 200, 'Data fetched successfully', brands)
    } catch (e) {
        console.error('❌ Error in listMakes:', e)
        console.error('❌ Error stack:', e.stack)
        resUtils.sendError(res, 500, 'Internal server error', e.message)
    }
}
const listModels = async (req, res) => {
    try {
        const modelList = await modelService.findAggregation(req.query)
        resUtils.sendSuccess(res, 200, 'Data fetched successfully', modelList)
    } catch (e) {
        console.log('Error in listModels: ', e)
        resUtils.sendError(res, 500, 'Internal server error')
    }
}
const listVariants = async (req, res) => {
    try {
        const variantList = await variantServices.findAggregation(req.query)
        resUtils.sendSuccess(res, 200, 'Data fetched successfully', variantList)
    } catch (e) {
        console.log('Error in listVariants: ', e)
        resUtils.sendError(res, 500, 'Internal server error')
    }
}
const changeMakePopular = async (req, res) => {
    try {
        const { changeIndexes = [] } = req.body
        const changeIndexLength = changeIndexes.length
        for (let i = 0; i < changeIndexLength; i++) {
            const { nameOne, nameTwo } = changeIndexes[i] || {}
            await makeService.changePopularIndex(nameOne, nameTwo)
        }
        resUtils.sendSuccess(res, 200, 'Popular updated successfully')
    } catch (e) {
        console.log('Error in changeMakePopular: ', e)
        resUtils.sendError(res, 500, 'Internal server error')
    }
}
const carController = {
    listMakes,
    listModels,
    listVariants,
    changeMakePopular,
}
export default carController
