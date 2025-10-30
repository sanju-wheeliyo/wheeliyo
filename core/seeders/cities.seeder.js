import cityService from 'core/services/cities.services'

export default async function seedCities() {
    try {
        console.log('🏙️ Starting cities seeding...')
        
        // Cities that match the demo car locations
        const citiesData = [
            {
                name: 'Mumbai',
                state: 'Maharashtra',
                lat: 19.0760,
                lng: 72.8777,
                location: {
                    type: 'Point',
                    coordinates: [72.8777, 19.0760] // [longitude, latitude]
                }
            },
            {
                name: 'Delhi',
                state: 'Delhi',
                lat: 28.7041,
                lng: 77.1025,
                location: {
                    type: 'Point',
                    coordinates: [77.1025, 28.7041]
                }
            },
            {
                name: 'Bangalore',
                state: 'Karnataka',
                lat: 12.9716,
                lng: 77.5946,
                location: {
                    type: 'Point',
                    coordinates: [77.5946, 12.9716]
                }
            },
            {
                name: 'Chennai',
                state: 'Tamil Nadu',
                lat: 13.0827,
                lng: 80.2707,
                location: {
                    type: 'Point',
                    coordinates: [80.2707, 13.0827]
                }
            },
            {
                name: 'Ahmedabad',
                state: 'Gujarat',
                lat: 23.0225,
                lng: 72.5714,
                location: {
                    type: 'Point',
                    coordinates: [72.5714, 23.0225]
                }
            },
            {
                name: 'Hyderabad',
                state: 'Telangana',
                lat: 17.3850,
                lng: 78.4867,
                location: {
                    type: 'Point',
                    coordinates: [78.4867, 17.3850]
                }
            },
            {
                name: 'Kolkata',
                state: 'West Bengal',
                lat: 22.5726,
                lng: 88.3639,
                location: {
                    type: 'Point',
                    coordinates: [88.3639, 22.5726]
                }
            },
            {
                name: 'Pune',
                state: 'Maharashtra',
                lat: 18.5204,
                lng: 73.8567,
                location: {
                    type: 'Point',
                    coordinates: [73.8567, 18.5204]
                }
            },
            {
                name: 'Jaipur',
                state: 'Rajasthan',
                lat: 26.9124,
                lng: 75.7873,
                location: {
                    type: 'Point',
                    coordinates: [75.7873, 26.9124]
                }
            },
            {
                name: 'Lucknow',
                state: 'Uttar Pradesh',
                lat: 26.8467,
                lng: 80.9462,
                location: {
                    type: 'Point',
                    coordinates: [80.9462, 26.8467]
                }
            }
        ]

        const createdCities = []
        for (const cityData of citiesData) {
            const existingCity = await cityService.getCityByName(cityData.name)
            if (!existingCity) {
                const city = await cityService.createACity(cityData)
                createdCities.push(city)
                console.log(`✅ Created city: ${cityData.name}`)
            } else {
                createdCities.push(existingCity)
                console.log(`ℹ️ City already exists: ${cityData.name}`)
            }
        }

        console.log('🎉 Cities seeding completed successfully!')
        console.log(`📊 Created: ${createdCities.length} cities`)
        
        return createdCities
    } catch (error) {
        console.error('❌ Error seeding cities:', error)
        throw error
    }
}
