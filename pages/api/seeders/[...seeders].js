import handler from 'core/config/nextConnect.config'
import { dbSeedController } from 'core/controllers/dbSeed.controller'
export default handler().post('/api/seeders/seed_all', dbSeedController)
