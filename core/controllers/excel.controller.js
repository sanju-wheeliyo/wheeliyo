import makeService from 'core/services/make.services'
import modelService from 'core/services/model.services'
import variantServices from 'core/services/variant.services'
import commonUtils from 'core/utils/common.utils'
import excelUtils from 'core/utils/excel.utils'
import resUtils from 'core/utils/res.utils'

const importCars = async (req, res) => {
    try {
        console.time();
        const cacheMake = []
        const cacheModel = []
        const sheetArray = await excelUtils.readExcelData(req.file.path)
        const sheetArrayLength = sheetArray.length
        console.log("[*] Total Length: ", sheetArrayLength)
        console.log("[*] starting to insert in database...")
        // popular latest number
        let lastMake = await makeService.fetchLast()
        let makePopularNum = lastMake[0]?.popular || 0
        let lastModel = await modelService.fetchLast()
        let modelPopularNum = lastModel[0]?.popular || 0
        for (let i = 0; i < sheetArrayLength; i++) {
            let data = sheetArray[i]
            let currentMake = null
            let currentModel = null
            if(Object.keys(data).length===0) continue;
            console.log(i, data)
            // checking current make is cached
            currentMake = cacheMake.find((value) => value.name === data['naming.make'])
            // checking current make is added in db
            if (!currentMake) {
                currentMake = await makeService.find({ name: data['naming.make'] })
                if (currentMake) {
                    cacheMake.push({
                        name: currentMake.name,
                        _id: currentMake._id,
                    })
                }
            }
            // adding current make to db
            if (!currentMake) {
                makePopularNum++
                currentMake = await makeService.create({
                    name: data['naming.make'],
                    popular: makePopularNum,
                })
                cacheMake.push({
                    name: currentMake.name,
                    _id: currentMake._id,
                })
            }

            // // checking any model have
            // if(!data['naming.model']) continue;

            // checking current model is cached
            currentModel = cacheModel.find(
                (value) => value.name.toLowerCase() === excelUtils.returnModelOnly(data['naming.model']).toLowerCase()
            )

            // checking current model is in db
            if (!currentModel) {
                currentModel = await modelService.find({
                    name: excelUtils.returnModelOnly(data['naming.model']),
                    make_id: currentMake._id,
                })
                if (currentModel)
                    cacheModel.push({
                        name: currentModel.name,
                        _id: currentModel._id,
                    })
            }
            // adding current model to db
            if (!currentModel) {
                modelPopularNum++
                currentModel = await modelService.create({
                    name: excelUtils.returnModelOnly(data['naming.model']),
                    make_id: currentMake._id,
                    popular: modelPopularNum,
                })
                cacheModel.push({
                    name: currentModel.name,
                    _id: currentModel._id,
                })
            }

            // checking any model have
            if(!data['naming.version']) continue;

            // checking modal variant if exists! continue to next iteration
            const isVariantExists = await variantServices.exists({
                name: data['naming.version'],
                model_id: currentModel._id,
            })
            if (isVariantExists) continue

            // inserting into variant db
            let price = commonUtils.excelPriceToNumber(data['naming.price'])
            await variantServices.create({ ...data, price, model_id: currentModel._id });
        }
        console.log("[*] Insetion completed");
        console.timeEnd();
        resUtils.sendSuccess(res, 200, 'Data inserted successfully')
    } catch (e) {
        console.log(e)
        resUtils.sendError(res, 500, 'Internal server error')
    }
}
const excelController = {
    importCars,
}
export default excelController
