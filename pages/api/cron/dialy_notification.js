import nextConnect from 'next-connect'
import cronController from 'core/controllers/cron.controller'

const handler = nextConnect()

handler.post(cronController.DialyWhatsAppNotification)

export default handler
