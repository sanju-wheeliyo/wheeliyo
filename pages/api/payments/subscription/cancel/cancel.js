import subscriptionController from 'core/controllers/subscription.controller'
import handler from 'core/config/nextConnect.config'
const apiHandler = handler()
apiHandler.put(subscriptionController.cancelUserSubscription)
export default apiHandler
