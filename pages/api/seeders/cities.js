import dbConnect from 'core/config/db.config'
import seedCities from 'core/seeders/cities.seeder'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }
    
    try {
        await dbConnect()
        console.log('🏙️ Starting cities seeding...')
        const cities = await seedCities()
        
        res.status(200).json({
            success: true,
            message: 'Cities seeded successfully!',
            count: cities.length,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('❌ Error in cities seeding API:', error)
        res.status(500).json({
            success: false,
            message: 'Error seeding cities',
            error: error.message
        })
    }
}
