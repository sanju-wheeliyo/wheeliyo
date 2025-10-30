import multerUpload from 'core/config/multer.config'
import handler from 'core/config/nextConnect.config'
import excelController from 'core/controllers/excel.controller'

export default handler()
    .use('/api/import/excel/cars', multerUpload.single('excel'))
    .post('/api/import/excel/cars', excelController.importCars)

export const config = {
    api: {
        bodyParser: false,
        responseLimit: false,
    },
}
