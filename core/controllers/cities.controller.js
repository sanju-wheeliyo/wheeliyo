import cityServices from 'core/services/cities.services'
import resUtils from 'core/utils/res.utils'
import userServices from 'core/services/user.services'

const getCities = async (req, res, next) => {
    try {
        const { page = 1, size = 10, search } = req.query

        // Convert to numbers for proper comparison
        const pageNum = parseInt(page);
        const sizeNum = parseInt(size);

        // Only use pagination when explicitly requested (page > 1) or when search is provided
        if (search || pageNum > 1 || sizeNum !== 10) {
            const result = await cityServices.getAllCitiesFilterBy(
                search || '',
                pageNum,
                sizeNum
            )

            return resUtils.sendSuccess(
                res,
                200,
                'Cities fetched successfully',
                result.data,
                {
                    totalCount: result.count,
                    currentPage: pageNum,
                    pageSize: sizeNum,
                    totalPages: Math.ceil(result.count / sizeNum)
                }
            )
        } else {
            // Return all cities for backward compatibility
            const cities = await cityServices.getAllCities()
            return resUtils.sendSuccess(
                res,
                200,
                'Cities fetched successfully',
                cities
            )
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const createACity = async (req, res, next) => {
    try {
        const body = req.body
        const { name } = body

        const data = {
            name,
        }
        const isCityExist = await cityServices.getCityByName(name)
        const errors = [
            {
                message: 'City already exist',
                field: 'name',
            },
        ]

        if (isCityExist)
            return resUtils.sendError(res, 400, 'City already exist', errors)

        const response = await cityServices.createACity(data)
        resUtils.sendSuccess(res, 200, 'City created successfully', response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const updateACity = async (req, res, next) => {
    try {
        const body = req.body
        const { name, id } = body

        const data = {
            name,
        }
        const response = await cityServices.updateACity(id, data)
        resUtils.sendSuccess(res, 200, 'City updated successfully', response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const deleteACity = async (req, res, next) => {
    try {
        const { id } = req.query

        const response = await cityServices.deleteACity(id)
        resUtils.sendSuccess(res, 200, 'City deleted successfully', response)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const findNearestCity = async (req, res, next) => {
    try {
        const { maxDistance = 100 } = req.query;

        // Get user from token (set by auth middleware)
        const userId = req.user?.id;
        if (!userId) {
            return resUtils.sendError(res, 401, 'User not authenticated');
        }

        // Get user data including location
        const user = await userServices.getUserById(userId);
        if (!user) {
            return resUtils.sendError(res, 404, 'User not found');
        }

        let latitude, longitude;
        let locationSource = 'coordinates';

        // Check if user has location coordinates
        if (user.location && user.location.coordinates) {
            latitude = user.location.coordinates[1]; // lat is at index 1
            longitude = user.location.coordinates[0]; // lng is at index 0
        }
        // Fallback: If no coordinates but user has a city, try to get coordinates from city
        else if (user.city) {
            const cityCoords = await cityServices.getCityByName(user.city);
            if (cityCoords && cityCoords.location && cityCoords.location.coordinates) {
                latitude = cityCoords.location.coordinates[1];
                longitude = cityCoords.location.coordinates[0];
                locationSource = 'city_lookup';
            } else {
                return resUtils.sendError(res, 400, 'User location not available. Please update your location or city in your profile.');
            }
        } else {
            return resUtils.sendError(res, 400, 'User location not available. Please update your location or city in your profile.');
        }

        const nearestCity = await cityServices.findNearestCity(
            latitude,
            longitude,
            parseInt(maxDistance)
        );

        if (!nearestCity) {
            return resUtils.sendError(res, 404, 'No cities found within the specified distance');
        }

        return resUtils.sendSuccess(
            res,
            200,
            'Nearest city found successfully',
            {
                ...nearestCity,
                userLocation: {
                    latitude,
                    longitude,
                    source: locationSource
                }
            }
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export default {
    getCities,
    createACity,
    updateACity,
    deleteACity,
    findNearestCity,
}
