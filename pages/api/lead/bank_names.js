import nextConnect from 'next-connect'
import leadsController from 'core/controllers/leads.controller'

const handler = nextConnect()

handler.get(leadsController.getBankNames)

export default handler
