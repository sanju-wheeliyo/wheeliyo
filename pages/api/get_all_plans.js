import nextConnect from 'next-connect'
import SubscriptionController from 'core/controllers/subscription.controller'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'
const handler = nextConnect()

handler.get(SubscriptionController.getAllPlans)

export default handler
