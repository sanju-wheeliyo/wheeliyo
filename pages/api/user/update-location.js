import nextConnect from 'next-connect'
import userServices from 'core/services/user.services'
import resUtils from 'core/utils/res.utils'
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware'

const handler = nextConnect()

handler.put(
    authenticateTokenMiddleware,
    async (req, res) => {
        try {
            const userId = req.user.id
            const { latitude, longitude, city } = req.body

            // Validate coordinates
            if (latitude !== undefined && longitude !== undefined) {
                const lat = parseFloat(latitude)
                const lng = parseFloat(longitude)
                
                if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    return resUtils.sendError(res, 400, 'Invalid latitude or longitude coordinates')
                }

                const updateData = {
                    location: {
                        type: 'Point',
                        coordinates: [lng, lat], // MongoDB stores as [longitude, latitude]
                    },
                    ...(city && { city })
                }

                await userServices.updateUserById(userId, updateData)

                return resUtils.sendSuccess(res, 200, 'User location updated successfully', {
                    latitude: lat,
                    longitude: lng,
                    city: city || null
                })
            } else if (city) {
                // If only city is provided, try to get coordinates
                const City = (await import('core/models/city')).default
                const cityDoc = await City.findOne({ name: { $regex: new RegExp(city, 'i') } })
                
                if (cityDoc && cityDoc.location) {
                    const lat = cityDoc.location.coordinates[1]
                    const lng = cityDoc.location.coordinates[0]
                    
                    const updateData = {
                        location: {
                            type: 'Point',
                            coordinates: [lng, lat],
                        },
                        city
                    }

                    await userServices.updateUserById(userId, updateData)

                    return resUtils.sendSuccess(res, 200, 'User location updated successfully', {
                        latitude: lat,
                        longitude: lng,
                        city
                    })
                } else {
                    return resUtils.sendError(res, 400, 'City not found in database')
                }
            } else {
                return resUtils.sendError(res, 400, 'Either latitude/longitude or city is required')
            }
        } catch (error) {
            console.error('Error updating user location:', error)
            return resUtils.sendError(res, 500, 'Internal server error')
        }
    }
)

export default handler 