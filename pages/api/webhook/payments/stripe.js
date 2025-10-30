import paymentsController from 'core/controllers/payments.controller'
import handler from 'core/config/nextConnect.config'
const apiHandler = handler()

apiHandler.post(paymentsController.webhooks)
export default apiHandler
// export const config = {
//     api: {
//         bodyParser: false,
//     },
// }
