import dbConnect from 'core/config/db.config'
import seedDemoCars from 'core/seeders/demoCars.seeder'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        await dbConnect()

        console.log('🌱 Starting demo cars seeding...')
        await seedDemoCars()

        res.status(200).json({
            success: true,
            message: 'Demo cars seeded successfully!',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('❌ Error in demo cars seeding API:', error)
        res.status(500).json({
            success: false,
            message: 'Error seeding demo cars',
            error: error.message
        })
    }
}
