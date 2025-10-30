import nextConnect from 'next-connect'
import leadsController from 'core/controllers/leads.controller'

const handler = nextConnect()

handler.get(leadsController.getAuctionLocations)

export default handler
