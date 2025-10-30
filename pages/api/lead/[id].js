import nextConnect from 'next-connect'
import leadsController from 'core/controllers/leads.controller'

const handler = nextConnect()

handler.get(leadsController.getLeadDetails)

export default handler
