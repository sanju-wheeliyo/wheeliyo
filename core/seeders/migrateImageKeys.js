import leadsServices from '../services/leads.services'

export default async function seedMigrateImageKeys() {
    await leadsServices.migrateImageKeys()
}
