import city from 'core/models/city'

const bulkInsert = async (data) => {
    const res = await city.insertMany(data)
    return res
}
const getAllCities = async () => {
    return await city.find()
}

const getAllCitiesFilterBy = async (search, page, limit) => {
    let searchRegex;

    if (search && search.trim()) {
        // Use partial matching for flexible search
        // This allows "koch" to match "Kochi" and "assam" to match "Assamannu"
        searchRegex = new RegExp(search.trim(), 'i');
    }

    const pipeline = [
        // First, match cities that contain the search term
        ...(search && search.trim() ? [{
            $match: {
                name: searchRegex
            },
        }] : []),
        // Group by name to ensure uniqueness (in case there are duplicate city names)
        {
            $group: {
                _id: "$name", // Group by city name to ensure uniqueness
                cityId: { $first: "$_id" },
                name: { $first: "$name" },
                createdAt: { $first: "$createdAt" },
                location: { $first: "$location" }
            }
        },
        // Sort by creation date (newest first)
        {
            $sort: { createdAt: -1 }
        }
    ]

    const res = await city.aggregate([
        ...pipeline,
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        }
    ])

    const count = await city.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ])

    return {
        data: res,
        count: count[0]?.total,
    }
}

const getCityByName = async (name) => {
    const res = await city.findOne({ name: name })
    return res ? res?.toJSON() : null
}

const createACity = async (data) => {
    return await city.create(data)
}

const updateACity = async (id, data) => {
    return await city.findByIdAndUpdate({ _id: id }, data, { new: true })
}

const deleteACity = async (id) => {
    return await city.deleteOne({ _id: id })
}

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

const findNearestCity = async (userLat, userLon, maxDistance = 100) => {
    try {
        // Get all cities from database
        const allCities = await city.find({ location: { $exists: true } });

        let nearestCity = null;
        let shortestDistance = Infinity;

        // Calculate distance to each city
        for (const cityData of allCities) {
            if (cityData.location && cityData.location.coordinates) {
                const [cityLon, cityLat] = cityData.location.coordinates;
                const distance = calculateDistance(userLat, userLon, cityLat, cityLon);

                // Check if this city is closer and within max distance
                if (distance < shortestDistance && distance <= maxDistance) {
                    shortestDistance = distance;
                    nearestCity = {
                        name: cityData.name,
                        distance: Math.round(distance * 10) / 10, // Round to 1 decimal
                        coordinates: cityData.location.coordinates
                    };
                }
            }
        }

        return nearestCity;
    } catch (error) {
        console.error('Error finding nearest city:', error);
        return null;
    }
}

export default {
    bulkInsert,
    getAllCities,
    createACity,
    updateACity,
    deleteACity,
    getCityByName,
    getAllCitiesFilterBy,
    findNearestCity,
}
