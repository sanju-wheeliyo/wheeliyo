import fuelTypeService from 'core/services/fuelType.service'
import leadsServices from 'core/services/leads.services'
import transmissionTypeServices from 'core/services/transmissionType.services'
import resUtils from 'core/utils/res.utils'
import ParentType from 'core/constants/parent_type.constants'
import EntityTypes from 'core/constants/entity_types.constants'
import notificationService from 'core/services/notification.service'
import roleServices from 'core/services/role.services'
import userServices from 'core/services/user.services'
import { createMessage } from 'core/utils/twilio.utils'
import modelService from 'core/services/model.services'
import makeService from 'core/services/make.services'
import {
    uploadFile,
    deleteS3Object,
    retrieveFile,
} from 'core/utils/storage.utils'
import { v4 as uuidv4 } from 'uuid'
import Leads from 'core/models/leads'
import City from 'core/models/city'
import mongoose from 'mongoose'

/**
 * Helper function to get city coordinates from the cities collection
 * @param {string} cityName - The name of the city to look up
 * @returns {Object|null} - Object with latitude and longitude, or null if city not found
 */
const getCityCoordinates = async (cityName) => {
    try {
        const city = await City.findOne({
            name: { $regex: new RegExp(cityName, 'i') },
        })
        if (city && city.location) {
            return {
                latitude: city.location.coordinates[1], // lat is at index 1
                longitude: city.location.coordinates[0], // lng is at index 0
            }
        }
        return null
    } catch (error) {
        console.error('Error fetching city coordinates:', error)
        return null
    }
}

const createLeads = async (req, res, next) => {
    try {
        const { vehicle, car_type, owner } = req.body

        // Determine if this is from mobile app or website
        // Mobile app: sends files/documents (multipart/form-data)
        // Website: sends only JSON data (no files)
        const hasFiles = req.files && Object.keys(req.files).length > 0
        const isAuthenticated = !!req.user
        const isMobileApp = hasFiles // Better indicator than authentication

        console.log('🔍 Lead creation flow:', {
            hasFiles,
            isAuthenticated,
            isMobileApp,
            filesCount: req.files ? Object.keys(req.files).length : 0,
        })
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2))

        // For website flow (no files), validate owner information
        // For mobile app, owner info comes from req.user
        if (!isMobileApp && (!owner || !owner.name || !owner.contact)) {
            return resUtils.sendError(
                res,
                400,
                'Owner name and contact are required'
            )
        }

        // Handle both formats: nested vehicle object or flat structure
        let parsedVehicle
        if (vehicle) {
            // If vehicle is provided as nested object
            parsedVehicle =
                typeof vehicle === 'string' ? JSON.parse(vehicle) : vehicle
        } else {
            // If vehicle fields are sent directly in request body
            parsedVehicle = req.body
        }

        console.log('🚗 Parsed vehicle:', parsedVehicle)

        // For mobile app flow (with files), vehicle number is required
        // For website flow (no files), vehicle number is optional
        if (isMobileApp && !parsedVehicle?.number?.trim()) {
            console.log(
                '❌ Vehicle number validation failed for mobile app submission'
            )
            return resUtils.sendError(res, 400, 'Vehicle number is required')
        }

        // Convert price to number explicitly
        if (parsedVehicle?.price) {
            parsedVehicle.price = Number(parsedVehicle.price)
        }

        // Optional: add type check
        if (parsedVehicle?.location) {
            parsedVehicle.location = String(parsedVehicle.location)
        }

        const files = req.files

        // Construct document object from uploaded files (S3)
        const docFields = [
            'rc',
            'puc',
            'insurance',
            'car_front',
            'car_back',
            'car_left',
            'car_right',
            'car_interior_front',
            'car_frontside_left',
            'car_frontside_right',
            'car_backside_right',
            'car_backside_left',
            'car_interior_back',
            'odometer',
            'service_history',
        ]
        const documents = {}
        const pdfFields = ['rc', 'puc', 'insurance', 'service_history']
        const imageFields = [
            'car_front',
            'car_back',
            'car_left',
            'car_right',
            'car_interior_front',
            'car_frontside_left',
            'car_frontside_right',
            'car_backside_right',
            'car_backside_left',
            'car_interior_back',
            'odometer',
        ]
        const uploadPromises = []
        for (const field of docFields) {
            if (files?.[field]?.[0]) {
                const file = files[field][0]
                const uuid = uuidv4()

                // File type validation based on mimetype only
                if (pdfFields.includes(field)) {
                    if (file.mimetype !== 'application/pdf') {
                        console.warn(
                            `❌ Invalid mimetype for ${field}, expected PDF`
                        )
                        return resUtils.sendError(
                            res,
                            400,
                            `${field} must be a PDF file`
                        )
                    }
                } else if (imageFields.includes(field)) {
                    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
                        console.warn(
                            `❌ Invalid mimetype for ${field}, expected JPG/PNG`
                        )
                        return resUtils.sendError(
                            res,
                            400,
                            `${field} must be an image (jpg, jpeg, png)`
                        )
                    }
                }

                // Use correct extension based on mimetype
                let ext = ''
                if (file.mimetype === 'application/pdf') ext = 'pdf'
                else if (file.mimetype === 'image/jpeg') ext = 'jpg'
                else if (file.mimetype === 'image/png') ext = 'png'
                else {
                    console.warn(
                        `❌ Unsupported mimetype: ${file.mimetype} for ${field}`
                    )
                    return resUtils.sendError(
                        res,
                        400,
                        `Unsupported file type for ${field}`
                    )
                }

                const s3Key = `lead_docs/${field}/${uuid}.${ext}`

                // Push upload promise to array for parallel upload
                uploadPromises.push(
                    uploadFile(null, s3Key, file.buffer, file.mimetype)
                        .then(() => {
                            documents[field] = {
                                s3Key,
                                contentType: file.mimetype,
                                originalName: file.originalname,
                            }
                        })
                        .catch((uploadErr) => {
                            console.error(
                                `❌ Upload failed for ${field}:`,
                                uploadErr
                            )
                            throw new Error(`Failed to upload ${field}`)
                        })
                )
            }
        }
        // Wait for all uploads to finish
        try {
            await Promise.all(uploadPromises)
        } catch (err) {
            return resUtils.sendError(
                res,
                500,
                err.message || 'Failed to upload one or more files'
            )
        }

        // Normalize vehicle number - treat empty string as undefined
        if (parsedVehicle.number !== undefined) {
            const trimmed = parsedVehicle.number.trim()
            parsedVehicle.number = trimmed || undefined
        }

        // Vehicle number validation disabled - allowing duplicate vehicle numbers
        const vehicleNumber = parsedVehicle.number
        console.log('🔢 Vehicle number after normalization:', vehicleNumber)

        // Accept latitude, longitude, city, and notes from the request body
        const { latitude, longitude, city, notes } = req.body

        // Get coordinates - either from request or from city lookup
        let finalLatitude = latitude
        let finalLongitude = longitude

        if (!latitude || !longitude) {
            // Check city from request body first
            if (city) {
                const cityCoords = await getCityCoordinates(city)
                if (cityCoords) {
                    finalLatitude = cityCoords.latitude
                    finalLongitude = cityCoords.longitude
                }
            }
            // If still no coordinates, check vehicle.location
            else if (parsedVehicle?.location) {
                const cityCoords = await getCityCoordinates(
                    parsedVehicle.location
                )
                if (cityCoords) {
                    finalLatitude = cityCoords.latitude
                    finalLongitude = cityCoords.longitude
                }
            }
            // If still no coordinates, check vehicle.registered_state (since that's where location is stored)
            else if (parsedVehicle?.registered_state) {
                const cityCoords = await getCityCoordinates(
                    parsedVehicle.registered_state
                )
                if (cityCoords) {
                    finalLatitude = cityCoords.latitude
                    finalLongitude = cityCoords.longitude
                }
            }
        }

        // Build clean vehicle object - only include number if it exists
        const cleanVehicle = {
            ...parsedVehicle,
        }

        // Remove number field if it's undefined (don't save empty strings)
        if (!vehicleNumber) {
            delete cleanVehicle.number
        }

        console.log('✨ Clean vehicle object:', cleanVehicle)

        // Build lead payload - handle both mobile app and website flows
        const leadPayload = {
            // Owner info:
            // - Mobile app (with files): use authenticated user info (req.user)
            // - Website (no files): use owner from request body
            owner:
                isMobileApp && isAuthenticated
                    ? {
                          name: req.user.name,
                          contact: req.user.phone,
                      }
                    : owner || {},
            vehicle: cleanVehicle,
            car_type: car_type || 'pre-owned',
            // user_id: only for authenticated requests (both mobile app and website if user is logged in)
            ...(isAuthenticated && { user_id: req._id }),
            documents,
            fuel_type: parsedVehicle.fuel_type,
            transmission_type: parsedVehicle.transmission_type,
            ...(notes && { notes }), // Add notes if provided
            ...(finalLatitude &&
                finalLongitude &&
                !isNaN(parseFloat(finalLatitude)) &&
                !isNaN(parseFloat(finalLongitude)) && {
                    coordinates: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(finalLongitude),
                            parseFloat(finalLatitude),
                        ],
                    },
                }),
        }

        console.log(
            '📤 Final lead payload:',
            JSON.stringify(leadPayload, null, 2)
        )

        const lead = await leadsServices.create(leadPayload)

        console.log('✅ Lead created successfully:', lead._id)

        resUtils.sendSuccess(res, 200, 'Lead created successfully', lead)

        // Notify Admins
        const adminRole = await roleServices.FindRoleDetailsByName('Admin')
        const admin_notifiers = await userServices.findRoleNotifiers(
            adminRole._id
        )
        const notifier_ids = admin_notifiers.map((notifier) => notifier._id)

        const model = await modelService.findById(parsedVehicle.model_id)
        const brand = await makeService.findById(parsedVehicle.brand_id)

        const Meta = {
            title: `New lead onboarded`,
            body:
                brand?.name || model?.name
                    ? `A new car ${brand?.name ? `${brand?.name} ` : ''}${
                          model?.name ? `${model?.name}` : ''
                      } lead is onboarded. Visit list for more`
                    : 'A new lead is onboarded. Visit list for more',
        }

        const notifications = notifier_ids.map((admin_id) => ({
            actor: null,
            notifier: admin_id,
            parent_id: lead._id,
            parent_type: ParentType.LEAD,
            entity_type: EntityTypes.LEAD_ONBOARDED,
            read: false,
            meta: Meta,
            isDeleted: false,
        }))

        await notificationService.createNotification(notifications)
    } catch (error) {
        console.log('❌ Lead creation failed:', error)
        next(error)
    }
}

const getFuelTypes = async (req, res) => {
    try {
        const fuel_types = await fuelTypeService.getAllFuelType()
        return resUtils.sendSuccess(
            res,
            200,
            'fuel types fetched successfully',
            fuel_types
        )
    } catch (error) {
        console.log('❌ Get fuel types failed:', error)
        return resUtils.sendError(
            res,
            500,
            'Failed to fetch fuel types',
            error.message
        )
    }
}
const getTransmissionTypes = async (req, res) => {
    try {
        const transmission_types =
            await transmissionTypeServices.getAllTransmissionTypes()
        return resUtils.sendSuccess(
            res,
            200,
            'Transmission types fetched successfully',
            transmission_types
        )
    } catch (error) {
        console.log('❌ Get transmission types failed:', error)
        return resUtils.sendError(
            res,
            500,
            'Failed to fetch transmission types',
            error.message
        )
    }
}
/**
 * Get leads with location-based sorting (no distance filtering)
 *
 * Location-based sorting parameters:
 * - user_latitude, user_longitude: User's coordinates (optional)
 * - user_city: User's city name (optional, used if coordinates not provided)
 *
 * When location parameters are provided:
 * 1. All cars are included (no distance limit)
 * 2. Cars are sorted by distance (nearest first)
 * 3. Cars without coordinates are included but sorted last
 *
 * When no location parameters are provided:
 * 1. All cars are returned (no distance filtering)
 * 2. Cars are sorted by approval date (newest first)
 */
const getLeads = async (req, res) => {
    try {
        const {
            car_type,
            brand_id,
            model_id,
            variant_id,
            state,
            yom,
            yom_min,
            yom_max,
            isLiked,
            auction_location,
            auction_start_date,
            auction_end_date,
            fuel_type_id,
            transmission_type_id,
            search,
            isLandingPage,
            bank_name,
            price_min,
            price_max,
            owner_count,
            km_driven_min,
            km_driven_max,
            sort_by,
            page,
            size,
            // Location-based sorting parameters (optional override)
            user_latitude,
            user_longitude,
            user_city,
        } = req.query

        // Validate price parameters
        if (price_min !== undefined && price_min !== null) {
            const minPrice = Number(price_min)
            if (isNaN(minPrice) || minPrice < 0) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid price_min parameter. Must be a positive number.'
                )
            }
        }

        if (price_max !== undefined && price_max !== null) {
            const maxPrice = Number(price_max)
            if (isNaN(maxPrice) || maxPrice < 0) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid price_max parameter. Must be a positive number.'
                )
            }
        }

        // Validate price range if both parameters are provided
        if (
            price_min !== undefined &&
            price_min !== null &&
            price_max !== undefined &&
            price_max !== null
        ) {
            const minPrice = Number(price_min)
            const maxPrice = Number(price_max)
            if (minPrice > maxPrice) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid price range. price_min cannot be greater than price_max.'
                )
            }
        }

        // Validate km_driven parameters
        if (km_driven_min !== undefined && km_driven_min !== null) {
            const minKm = Number(km_driven_min)
            if (isNaN(minKm) || minKm < 0) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid km_driven_min parameter. Must be a positive number.'
                )
            }
        }

        if (km_driven_max !== undefined && km_driven_max !== null) {
            const maxKm = Number(km_driven_max)
            if (isNaN(maxKm) || maxKm < 0) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid km_driven_max parameter. Must be a positive number.'
                )
            }
        }

        // Validate km_driven range if both parameters are provided
        if (
            km_driven_min !== undefined &&
            km_driven_min !== null &&
            km_driven_max !== undefined &&
            km_driven_max !== null
        ) {
            const minKm = Number(km_driven_min)
            const maxKm = Number(km_driven_max)
            if (minKm > maxKm) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid km_driven range. km_driven_min cannot be greater than km_driven_max.'
                )
            }
        }

        // Validate sort_by parameter
        if (sort_by !== undefined && sort_by !== null) {
            const validSortOptions = [
                'price_low_to_high',
                'price_high_to_low',
                'date_published',
                'distance',
                'relevance',
                'recently-added',
            ]
            if (!validSortOptions.includes(sort_by)) {
                return resUtils.sendError(
                    res,
                    400,
                    `Invalid sort_by parameter. Must be one of: ${validSortOptions.join(
                        ', '
                    )}`
                )
            }
        }

        // Get userId early for location fetching
        const userId = req.user.id

        // Validate owner_count parameter
        if (owner_count !== undefined && owner_count !== null) {
            const validOwnerCounts = ['single', '2', '3', '4_or_more']
            if (!validOwnerCounts.includes(owner_count)) {
                return resUtils.sendError(
                    res,
                    400,
                    `Invalid owner_count parameter. Must be one of: ${validOwnerCounts.join(
                        ', '
                    )}`
                )
            }
        }

        // Priority 1: Manual coordinates from query parameters
        let finalUserLatitude = user_latitude
        let finalUserLongitude = user_longitude
        let locationSource = 'manual' // Track where location came from

        if (user_latitude !== undefined && user_longitude !== undefined) {
            // Manual coordinates provided
            const lat = parseFloat(user_latitude)
            const lng = parseFloat(user_longitude)
            if (
                isNaN(lat) ||
                isNaN(lng) ||
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            ) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid latitude or longitude coordinates'
                )
            }
            finalUserLatitude = lat
            finalUserLongitude = lng
            locationSource = 'manual_coordinates'
        } else if (user_city) {
            // Manual city provided
            const cityCoords = await getCityCoordinates(user_city)
            if (cityCoords) {
                finalUserLatitude = cityCoords.latitude
                finalUserLongitude = cityCoords.longitude
                locationSource = 'manual_city'
            } else {
                // City not found, will try user profile location
            }
        }

        // Priority 2: Get location from user profile (token)
        if (!finalUserLatitude || !finalUserLongitude) {
            try {
                const user = await userServices.getUserById(userId)
                if (
                    user &&
                    user.location &&
                    user.location.coordinates &&
                    user.location.coordinates.length === 2 &&
                    user.location.coordinates[0] !== 0 &&
                    user.location.coordinates[1] !== 0
                ) {
                    finalUserLatitude = user.location.coordinates[1] // lat is at index 1
                    finalUserLongitude = user.location.coordinates[0] // lng is at index 0
                    locationSource = 'user_profile'
                } else if (user && user.city) {
                    // Try to get coordinates from user's city
                    const cityCoords = await getCityCoordinates(user.city)
                    if (cityCoords) {
                        finalUserLatitude = cityCoords.latitude
                        finalUserLongitude = cityCoords.longitude
                        locationSource = 'user_city'
                    }
                }
            } catch (error) {
                // Error fetching user location from profile
            }
        }

        const pageNumber = parseInt(page) || 1
        const pageSize = parseInt(size) || 10
        const only_ids = true

        const leads = await leadsServices.newlyAddedLeads(
            car_type,
            userId,
            only_ids
        )

        const exclude_lead_ids = leads.map((lead) => lead._id)
        const { data, count } = await leadsServices.getLeadsByfilter({
            car_type,
            brand_id,
            model_id,
            variant_id,
            state,
            yom,
            yom_min,
            yom_max,
            isLiked,
            userId,
            auction_location,
            auction_start_date,
            auction_end_date,
            fuel_type_id,
            transmission_type_id,
            search,
            isLandingPage,
            bank_name,
            price_min,
            price_max,
            owner_count,
            km_driven_min,
            km_driven_max,
            sort_by,
            page: pageNumber,
            limit: pageSize,
            exclude_lead_ids,
            // Location-based sorting parameters (always pass if available)
            userLatitude: finalUserLatitude,
            userLongitude: finalUserLongitude,
            // Filter out sold cars from public listings
            excludeSoldLeads: true,
            // No maxDistanceKm - we want all leads, just sorted by distance
        })

        // Generate signed URLs for main car images (image_key) in list view
        // This ensures images can be displayed without 403 errors
        const dataWithSignedUrls = Array.isArray(data)
            ? data.map((lead) => {
                  if (lead.image_key) {
                      return {
                          ...lead,
                          image_key_signed_url: retrieveFile.signed(
                              lead.image_key
                          ),
                      }
                  }
                  return lead
              })
            : data

        const totalPages = Math.ceil(count / pageSize)
        const meta = {
            page: pageNumber,
            size: pageSize,
            totalPages,
            totalCount: count,
            // Add location-based sorting info if applicable
            ...(finalUserLatitude &&
                finalUserLongitude && {
                    locationSorting: {
                        userLatitude: finalUserLatitude,
                        userLongitude: finalUserLongitude,
                        userCity: user_city || null,
                        hasLocationData: true,
                        locationSource,
                        sortingMethod: 'distance_based_no_filtering',
                    },
                }),
        }

        return resUtils.sendSuccess(
            res,
            200,
            'leads fetched successfully',
            dataWithSignedUrls,
            meta
        )
    } catch (error) {
        return resUtils.sendError(
            res,
            500,
            'Internal server error while fetching leads'
        )
    }
}

const likeLeed = async (req, res, next) => {
    try {
        const userId = req.user.id

        const { id } = req.query
        const lead = await leadsServices.getLeadById(id)

        if (!lead) return resUtils.sendError(res, 500, 'Car not found')
        const liked = await leadsServices.likeLeed(id, userId)

        return resUtils.sendSuccess(res, 200, 'Car liked successfully')
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const getLeadDetails = async (req, res, next) => {
    try {
        const { id } = req.query

        const leadArr = await leadsServices.getLeadById(id)
        const lead = Array.isArray(leadArr) ? leadArr[0] : leadArr
        if (!lead)
            return resUtils.sendError(res, 400, 'Lead not found', {
                errors: [{ message: 'Lead not found', field: 'id' }],
            })

        // Populate city/location name for vehicle.location
        const cityId = lead?.vehicle?.location;
        let locationObject = null;
        if (cityId) {
            // If populated, skip; else, find in City collection
            if (typeof cityId === 'object' && cityId.name) {
                locationObject = cityId;
            } else {
                locationObject = await City.findById(cityId);
            }
        }
        if (locationObject) {
            lead.vehicle.location = {
                _id: locationObject._id,
                name: locationObject.name,
            }
        }
        // Extract fuel_type and transmission_type names if present
        const fuelTypeName =
            lead.fuel_type && lead.fuel_type.name ? lead.fuel_type.name : null
        const transmissionTypeName =
            lead.transmission_type && lead.transmission_type.name
                ? lead.transmission_type.name
                : null

        // Generate signed URLs for all document images (instead of direct S3 URLs)
        // Signed URLs work with <img> tags and don't require authentication headers
        // They expire after 24 hours (86400 seconds) as configured
        let documentImageLinks = {}
        if (lead.documents) {
            for (const [docType, docObj] of Object.entries(lead.documents)) {
                if (docObj && docObj.s3Key) {
                    // Generate signed URL that works with <img> tags
                    // Signed URLs are time-limited but don't require auth headers
                    const signedUrl = retrieveFile.signed(docObj.s3Key)
                    documentImageLinks[docType] = signedUrl
                    console.log(
                        `🔗 Generated signed URL for document ${docType}:`,
                        signedUrl?.substring(0, 100) + '...'
                    )
                }
            }
        }

        // Generate signed URL for main car image (image_key) if it exists
        let imageKeySignedUrl = null
        if (lead.image_key) {
            imageKeySignedUrl = retrieveFile.signed(lead.image_key)
            console.log(
                '🔗 Generated signed URL for image_key:',
                imageKeySignedUrl?.substring(0, 100) + '...'
            )
        }

        // Generate signed URLs for image_keys array if it exists
        let imageKeysSignedUrls = []
        if (lead.image_keys && Array.isArray(lead.image_keys)) {
            imageKeysSignedUrls = lead.image_keys
                .map((key) => (key ? retrieveFile.signed(key) : null))
                .filter(Boolean)
            console.log(
                `🔗 Generated ${imageKeysSignedUrls.length} signed URLs for image_keys array`
            )
        }

        // Attach to response
        const response = {
            ...lead,
            fuel_type_name: fuelTypeName,
            transmission_type_name: transmissionTypeName,
            documentImageLinks,
            // Include signed URLs for main images
            ...(imageKeySignedUrl && {
                image_key_signed_url: imageKeySignedUrl,
            }),
            ...(imageKeysSignedUrls.length > 0 && {
                image_keys_signed_urls: imageKeysSignedUrls,
            }),
        }
        return resUtils.sendSuccess(
            res,
            200,
            'lead details fetched successfully',
            response
        )
    } catch (error) {
        console.log('error:', error)
        next(error)
    }
}
const getNewlyAddedLeads = async (req, res) => {
    try {
        const user = req.user
        const { car_type } = req.query
        const leads = await leadsServices.newlyAddedLeads(car_type, user.id)
        resUtils.sendSuccess(
            res,
            200,
            'Recently added leads fetched successfully',
            leads
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const getBankNames = async (req, res, next) => {
    try {
        const banks = await leadsServices.findUniqueBankNames()
        return resUtils.sendSuccess(
            res,
            200,
            'Bank names fetched successfully',
            banks
        )
    } catch (error) {
        next(error)
        console.log('error::', error)
    }
}
const unlikeLeed = async (req, res) => {
    try {
        const userId = req.user.id

        const { id } = req.query
        const lead = await leadsServices.getLeadById(id)

        if (!lead) return resUtils.sendError(res, 500, 'Car not found')
        const liked = await leadsServices.unlikeLeed(id, userId)

        return resUtils.sendSuccess(res, 200, 'Car Unliked successfully')
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const getAuctionLocations = async (req, res, next) => {
    try {
        const locations = await leadsServices.findUniqueAuctionLocations()
        return resUtils.sendSuccess(
            res,
            200,
            'Auction location fetched successfully',
            locations
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const reuploadLeadDoc = async (req, res) => {
    try {
        const { leadId, docType, docTypes } = req.body
        const files = req.files
        if (!leadId) {
            return resUtils.sendError(res, 400, 'leadId is required')
        }
        // Support both single and multiple docType(s)
        let docTypeList = []
        if (Array.isArray(docTypes)) {
            docTypeList = docTypes
        } else if (Array.isArray(docType)) {
            docTypeList = docType
        } else if (docTypes) {
            docTypeList = [docTypes]
        } else if (docType) {
            docTypeList = [docType]
        } else {
            // Try to infer from files
            docTypeList = Object.keys(files || {})
        }
        const docFields = [
            'rc',
            'puc',
            'insurance',
            'car_front',
            'car_back',
            'car_left',
            'car_right',
            'car_interior_front',
            'car_frontside_left',
            'car_frontside_right',
            'car_backside_right',
            'car_backside_left',
            'car_interior_back',
            'odometer',
            'service_history',
        ]
        const pdfFields = ['rc', 'puc', 'insurance', 'service_history']
        const imageFields = [
            'car_front',
            'car_back',
            'car_left',
            'car_right',
            'car_interior_front',
            'car_frontside_left',
            'car_frontside_right',
            'car_backside_right',
            'car_backside_left',
            'car_interior_back',
            'odometer',
        ]
        if (!docTypeList.length) {
            return resUtils.sendError(res, 400, 'No docType(s) provided')
        }
        // Validate all docTypes
        for (const dt of docTypeList) {
            if (!docFields.includes(dt)) {
                return resUtils.sendError(res, 400, `Invalid docType: ${dt}`)
            }
        }
        // Update the lead document(s)
        const leadArr = await leadsServices.getLeadById(leadId)
        const lead = Array.isArray(leadArr) ? leadArr[0] : leadArr
        if (!lead) {
            return resUtils.sendError(res, 404, 'Lead not found')
        }
        if (!lead.documents) {
            lead.documents = {}
        }
        const updatedDocs = {}
        for (const dt of docTypeList) {
            if (!files || !files[dt] || !files[dt][0]) {
                continue // skip missing files
            }
            // Delete old file from S3 if exists
            if (lead.documents[dt] && lead.documents[dt].s3Key) {
                try {
                    await deleteS3Object(lead.documents[dt].s3Key)
                    console.log(
                        `✅ Deleted old S3 file for ${dt}:`,
                        lead.documents[dt].s3Key
                    )
                } catch (err) {
                    console.error(
                        `Failed to delete old S3 file for ${dt}:`,
                        err
                    )
                }
            }
            const file = files[dt][0]
            const uuid = uuidv4()
            const ext = file.originalname.split('.').pop().toLowerCase()
            // File type validation
            if (pdfFields.includes(dt)) {
                if (ext !== 'pdf' || file.mimetype !== 'application/pdf') {
                    return resUtils.sendError(
                        res,
                        400,
                        `${dt} must be a PDF file`
                    )
                }
            } else if (imageFields.includes(dt)) {
                if (
                    !['jpg', 'jpeg', 'png'].includes(ext) ||
                    !['image/jpeg', 'image/png'].includes(file.mimetype)
                ) {
                    return resUtils.sendError(
                        res,
                        400,
                        `${dt} must be an image (jpg, jpeg, png)`
                    )
                }
            }
            const s3Key = `lead_docs/${dt}/${uuid}.${ext}`
            await uploadFile(null, s3Key, file.buffer, file.mimetype)
            lead.documents[dt] = {
                s3Key,
                contentType: file.mimetype,
                originalName: file.originalname,
                status: 'pending',
                rejectionReason: '',
            }
            updatedDocs[dt] = lead.documents[dt]
        }
        // Only update the specific document fields that were reuploaded
        const updateObj = {}
        for (const dt of Object.keys(updatedDocs)) {
            updateObj[`documents.${dt}`] = updatedDocs[dt]
        }
        // Also update documentStatus and leadApprovalStatus to 'pending' since documents need admin review
        updateObj.documentStatus = 'pending'
        updateObj.leadApprovalStatus = 'pending'
        await leadsServices.updateLeadDetails(leadId, { $set: updateObj })

        // Fetch vehicle brand and model names for notification
        let vehicleName = ''
        try {
            const brandId = lead.vehicle?.brand_id
            const modelId = lead.vehicle?.model_id
            let brandName = ''
            let modelName = ''
            if (brandId) {
                const brand = await makeService.findById(brandId)
                brandName = brand?.name || ''
            }
            if (modelId) {
                const model = await modelService.findById(modelId)
                modelName = model?.name || ''
            }
            vehicleName = [brandName, modelName].filter(Boolean).join(' ')
        } catch (err) {
            console.error('Failed to fetch vehicle name for notification:', err)
        }

        // Notify Admins about re-uploaded docs
        try {
            const adminRole = await roleServices.FindRoleDetailsByName('Admin')
            const admin_notifiers = await userServices.findRoleNotifiers(
                adminRole._id
            )
            const notifier_ids = admin_notifiers.map((notifier) => notifier._id)
            const reuploadedDocNames = Object.keys(updatedDocs).join(', ')
            const leadOwnerName = lead.owner?.name || 'Unknown'
            const Meta = {
                title: `Document(s) re-uploaded`,
                body: `User ${leadOwnerName} has re-uploaded document(s) (${reuploadedDocNames}) for lead ${
                    vehicleName ? ' ' + vehicleName : ''
                }. Please review the new submission(s).`,
            }
            const notifications = notifier_ids.map((admin_id) => ({
                actor: null,
                notifier: admin_id,
                parent_id: leadId,
                parent_type: ParentType.LEAD,
                entity_type: EntityTypes.LEAD_DOCUMENT_STATUS,
                read: false,
                meta: Meta,
                isDeleted: false,
            }))
            await notificationService.createNotification(notifications)
        } catch (notifyErr) {
            console.error(
                'Failed to send admin notification for re-uploaded docs:',
                notifyErr
            )
        }

        return resUtils.sendSuccess(
            res,
            200,
            'Documents re-uploaded successfully',
            updatedDocs
        )
    } catch (error) {
        console.error('Error re-uploading lead doc:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ])
    }
}

const deleteLeadByUser = async (req, res) => {
    try {
        const userId = req.user?.id || req._id
        const { leadId } = req.body
        if (!leadId) {
            return resUtils.sendError(res, 400, 'leadId is required')
        }
        const leadArr = await leadsServices.getLeadById(leadId)
        const lead = Array.isArray(leadArr) ? leadArr[0] : leadArr
        if (!lead) {
            return resUtils.sendError(res, 404, 'Lead not found')
        }

        const ObjectId = mongoose.Types.ObjectId

        const leadUserId =
            lead.user_id instanceof ObjectId
                ? lead.user_id
                : new ObjectId(lead.user_id)

        const reqUserId =
            userId instanceof ObjectId ? userId : new ObjectId(userId)

        if (!leadUserId.equals(reqUserId)) {
            return resUtils.sendError(
                res,
                403,
                'You are not authorized to delete this lead'
            )
        }

        await leadsServices.deleteLead(leadId)
        return resUtils.sendSuccess(res, 200, 'Lead deleted successfully')
    } catch (error) {
        console.error('Error deleting lead:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ])
    }
}

// Helper function to validate lead ownership
const validateLeadOwnership = (lead, userId) => {
    const ObjectId = mongoose.Types.ObjectId

    // Handle null/undefined cases
    if (!lead.user_id || !userId) {
        return false
    }

    try {
        // Convert both IDs to ObjectId for comparison
        const leadUserId =
            lead.user_id instanceof ObjectId
                ? lead.user_id
                : new ObjectId(lead.user_id)
        const reqUserId =
            userId instanceof ObjectId ? userId : new ObjectId(userId)

        return leadUserId.equals(reqUserId)
    } catch (error) {
        console.error('Error in validateLeadOwnership:', error)
        return false
    }
}

// Helper function to handle file uploads (both images and PDFs)
const handleFileUploads = async (files, existingLead, fileFields) => {
    const documentsUpdate = {}
    const uploadPromises = []

    // Define field types
    const pdfFields = ['rc', 'puc', 'insurance', 'service_history']
    const imageFields = [
        'car_front',
        'car_back',
        'car_left',
        'car_right',
        'car_interior_front',
        'car_frontside_left',
        'car_frontside_right',
        'car_backside_right',
        'car_backside_left',
        'car_interior_back',
        'odometer',
    ]

    for (const field of fileFields) {
        if (files?.[field]?.[0]) {
            const file = files[field][0]

            // Validate file type based on field
            if (pdfFields.includes(field)) {
                if (file.mimetype !== 'application/pdf') {
                    throw new Error(`${field} must be a PDF file`)
                }
            } else if (imageFields.includes(field)) {
                if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
                    throw new Error(
                        `${field} must be an image (jpg, jpeg, png)`
                    )
                }
            }

            // Delete old file if exists
            const oldDoc = existingLead?.documents?.[field]
            if (oldDoc?.s3Key) {
                uploadPromises.push(
                    deleteS3Object(oldDoc.s3Key).catch((err) =>
                        console.error(
                            `Failed to delete old S3 file for ${field}:`,
                            err
                        )
                    )
                )
            }

            // Upload new file
            const uuid = uuidv4()
            let ext = ''
            if (file.mimetype === 'application/pdf') {
                ext = 'pdf'
            } else if (file.mimetype === 'image/jpeg') {
                ext = 'jpg'
            } else if (file.mimetype === 'image/png') {
                ext = 'png'
            }
            const s3Key = `lead_docs/${field}/${uuid}.${ext}`

            // Create the document update object immediately
            documentsUpdate[`documents.${field}`] = {
                s3Key,
                contentType: file.mimetype,
                originalName: file.originalname,
                status: 'pending',
                rejectionReason: '',
            }

            uploadPromises.push(
                uploadFile(null, s3Key, file.buffer, file.mimetype)
            )
        }
    }

    await Promise.all(uploadPromises)
    return documentsUpdate
}

// Helper function to get vehicle name for notifications
const getVehicleName = async (vehicle) => {
    if (!vehicle?.brand_id && !vehicle?.model_id) return ''

    try {
        const [brand, model] = await Promise.all([
            vehicle.brand_id ? makeService.findById(vehicle.brand_id) : null,
            vehicle.model_id ? modelService.findById(vehicle.model_id) : null,
        ])

        const brandName = brand?.name || ''
        const modelName = model?.name || ''
        return [brandName, modelName].filter(Boolean).join(' ')
    } catch (err) {
        console.error('Failed to fetch vehicle name:', err)
        return ''
    }
}

// Helper function to send admin notifications
const sendAdminNotifications = async (
    leadId,
    carName,
    uploadedFields,
    actorId
) => {
    try {
        const adminRole = await roleServices.FindRoleDetailsByName('Admin')
        const admin_notifiers = await userServices.findRoleNotifiers(
            adminRole._id
        )
        const notifier_ids = admin_notifiers.map((notifier) => notifier._id)

        // Extract field names from the documents update object
        const fieldNames = Object.keys(uploadedFields).map((key) =>
            key.replace('documents.', '')
        )
        const uploadedDocNames = fieldNames.join(', ')
        const Meta = {
            title: 'New car images uploaded',
            body: `User ${actorId} uploaded new car images (${uploadedDocNames}) for lead ${leadId}${
                carName ? ' (' + carName + ')' : ''
            }. Please review and verify.`,
        }

        const notifications = notifier_ids.map((admin_id) => ({
            actor: null, // Set to null like in working examples
            notifier: admin_id,
            parent_id: String(leadId), // Convert to string as per schema
            parent_type: ParentType.LEAD,
            entity_type: EntityTypes.LEAD_DOCUMENT_STATUS,
            read: false,
            meta: Meta,
            isDeleted: false,
        }))

        await notificationService.createNotification(notifications)
    } catch (err) {
        console.error('Failed to send admin notifications:', err)
    }
}

/**
 * Update lead vehicle information
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.id - Lead ID
 * @param {Object} req.body - Request body
 * @param {Object} req.body.vehicle - Vehicle data to update
 * @param {string} req.body.vehicle.location - Vehicle location (city name) - automatically fetches coordinates
 * @param {Object} req.files - Uploaded files
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 *
 * @description
 * - Automatically fetches coordinates when vehicle.location is updated
 * - Supports manual coordinate override via latitude/longitude parameters
 * - Validates lead ownership before allowing updates
 * - Handles file uploads and document status updates
 */
const updateLeadVehicle = async (req, res, next) => {
    try {
        const { id } = req.query
        const data = req.body
        const files = req.files
        const userId = req.user?.id || req._id

        // Input validation
        if (!id) {
            return resUtils.sendError(res, 400, 'Lead ID is required')
        }

        // Parse form data - handle both string and object formats
        let parsedData = data || {}

        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data)
            } catch (err) {
                parsedData = {}
            }
        }

        // Handle case where vehicle is sent as a string (Postman form-data issue)
        if (parsedData.vehicle && typeof parsedData.vehicle === 'string') {
            try {
                parsedData.vehicle = JSON.parse(parsedData.vehicle)
            } catch (err) {
                // Vehicle parsing failed, continue with empty vehicle object
            }
        }

        // Destructure fields to update with default values
        const {
            owner,
            vehicle,
            car_type,
            auction_details,
            fuel_type_id,
            transmission_type_id,
            notes,
            latitude,
            longitude,
            city,
        } = parsedData || {}

        // Fetch existing lead with validation
        const existingLead = await Leads.findById(id)
        if (!existingLead) {
            return resUtils.sendError(res, 404, 'Lead not found')
        }

        // Validate ownership
        if (!validateLeadOwnership(existingLead, userId)) {
            return resUtils.sendError(
                res,
                403,
                'You are not authorized to update this lead'
            )
        }

        // Handle coordinates - either from request or from vehicle.location changes
        let finalLatitude = latitude
        let finalLongitude = longitude
        let finalCity = city

        // Check if vehicle.location is being updated and get coordinates for it
        if (
            vehicle &&
            vehicle.location &&
            vehicle.location !== existingLead.vehicle?.location
        ) {
            const cityCoords = await getCityCoordinates(vehicle.location)
            if (cityCoords) {
                finalLatitude = cityCoords.latitude
                finalLongitude = cityCoords.longitude
                console.log(
                    `📍 Found coordinates for vehicle.location "${vehicle.location}" in update:`,
                    cityCoords
                )
            } else {
                console.warn(
                    `⚠️ City "${vehicle.location}" not found in database during update`
                )
            }
        }
        // If no coordinates from vehicle.location, check manual city parameter
        else if (!latitude || !longitude) {
            if (city) {
                const cityCoords = await getCityCoordinates(city)
                if (cityCoords) {
                    finalLatitude = cityCoords.latitude
                    finalLongitude = cityCoords.longitude
                    console.log(
                        `📍 Found coordinates for city "${city}" in update:`,
                        cityCoords
                    )
                } else {
                    console.warn(
                        `⚠️ City "${city}" not found in database during update`
                    )
                }
            }
        } else if (latitude && longitude && !city) {
            // If coordinates are provided but no city, try to find the nearest city
            try {
                const nearestCity = await City.findOne({
                    location: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [
                                    parseFloat(longitude),
                                    parseFloat(latitude),
                                ],
                            },
                            $maxDistance: 50000, // 50km radius
                        },
                    },
                })
                if (nearestCity) {
                    finalCity = nearestCity.name
                    console.log(
                        `📍 Found nearest city "${finalCity}" for coordinates:`,
                        { latitude, longitude }
                    )
                }
            } catch (error) {
                console.warn(
                    `⚠️ Could not find nearest city for coordinates:`,
                    { latitude, longitude }
                )
            }
        }

        // Build update object
        const updateData = {}

        if (owner) updateData.owner = owner
        if (car_type) updateData.car_type = car_type
        if (auction_details) updateData.auction_details = auction_details
        if (fuel_type_id) updateData.fuel_type = fuel_type_id
        if (transmission_type_id)
            updateData.transmission_type = transmission_type_id

        // Add coordinates if provided
        if (
            finalLatitude &&
            finalLongitude &&
            !isNaN(parseFloat(finalLatitude)) &&
            !isNaN(parseFloat(finalLongitude))
        ) {
            updateData.coordinates = {
                type: 'Point',
                coordinates: [
                    parseFloat(finalLongitude),
                    parseFloat(finalLatitude),
                ],
            }
        }

        // Update vehicle.location if city is provided (but don't override if vehicle.location was already set)
        if (finalCity && !vehicle?.location) {
            if (!updateData.vehicle) {
                updateData.vehicle = { ...existingLead.vehicle }
            }
            updateData.vehicle.location = finalCity
        }

        // Handle vehicle updates - support partial updates
        if (vehicle && typeof vehicle === 'object') {
            // If vehicle is provided as a string, try to parse it
            let vehicleData = vehicle
            if (typeof vehicle === 'string') {
                try {
                    vehicleData = JSON.parse(vehicle)
                } catch (err) {
                    console.log(
                        '⚠️ Could not parse vehicle as JSON, using as-is'
                    )
                }
            }

            // Check if vehicle number is being updated
            if (
                vehicleData.number &&
                vehicleData.number !== existingLead.vehicle?.number
            ) {
                const newVehicleNumber = vehicleData.number.trim()

                // Escape special regex characters
                const escapedVehicleNumber = newVehicleNumber.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                )

                // Check for existing lead with same vehicle number (case-insensitive)
                // Only check leads that are not sold, withdrawn, or expired
                const existingLeadWithNumber = await Leads.findOne({
                    'vehicle.number': {
                        $regex: new RegExp(`^${escapedVehicleNumber}$`, 'i'),
                    },
                    _id: { $ne: id }, // Exclude current lead
                    leadStatus: { $nin: ['sold', 'withdrawn', 'expired'] }, // Exclude sold, withdrawn, and expired leads
                })

                if (existingLeadWithNumber) {
                    console.log(
                        '🚫 Duplicate vehicle number found during update:',
                        {
                            existingLeadId: existingLeadWithNumber._id,
                            vehicleNumber: newVehicleNumber,
                            leadStatus: existingLeadWithNumber.leadStatus,
                            approved: existingLeadWithNumber.approved,
                        }
                    )
                    return resUtils.sendError(
                        res,
                        400,
                        'This vehicle number is already listed.'
                    )
                }
            }

            // Merge with existing vehicle data, allowing partial updates
            updateData.vehicle = { ...existingLead.vehicle, ...vehicleData }
        }

        // Handle notes field separately (it's inside vehicle object in schema)
        if (notes !== undefined) {
            if (!updateData.vehicle) {
                updateData.vehicle = { ...existingLead.vehicle }
            }
            updateData.vehicle.notes = notes
        }

        // Also check if notes is inside the vehicle object (Postman form-data issue)
        if (parsedData.vehicle && parsedData.vehicle.notes !== undefined) {
            if (!updateData.vehicle) {
                updateData.vehicle = { ...existingLead.vehicle }
            }
            updateData.vehicle.notes = parsedData.vehicle.notes
        }

        // Handle file uploads if files are provided
        let documentsUpdate = {}
        let hasDocumentUpdates = false
        if (files && Object.keys(files).length > 0) {
            // Process all file fields that are actually provided
            const availableFileFields = Object.keys(files).filter((field) =>
                [
                    'car_front',
                    'car_back',
                    'car_left',
                    'car_right',
                    'car_interior_front',
                    'car_frontside_left',
                    'car_frontside_right',
                    'car_backside_right',
                    'car_backside_left',
                    'car_interior_back',
                    'odometer',
                    'rc',
                    'puc',
                    'insurance',
                    'service_history',
                ].includes(field)
            )
            documentsUpdate = await handleFileUploads(
                files,
                existingLead,
                availableFileFields
            )
            hasDocumentUpdates = Object.keys(documentsUpdate).length > 0
        }

        // Check if there are any updates to make
        const hasRegularUpdates = Object.keys(updateData).length > 0

        if (!hasRegularUpdates && !hasDocumentUpdates) {
            return resUtils.sendSuccess(res, 200, 'No changes to update')
        }

        // If documents are being updated, set approval statuses to pending
        if (hasDocumentUpdates) {
            updateData.allDocsApproved = false
            updateData.documentStatus = 'pending'
            updateData.leadApprovalStatus = 'pending'
            updateData.approved = false // Set approved to false when documents are re-uploaded
        }

        // Update the lead - handle documents separately from other fields
        let result
        if (hasDocumentUpdates) {
            // If we have document updates, we need to use $set for dot notation
            const finalUpdateData = {
                ...updateData,
                $set: {
                    ...(updateData.$set || {}),
                    ...documentsUpdate,
                },
            }
            result = await leadsServices.updateLeadDetails(id, finalUpdateData)
        } else {
            // If no document updates, use regular update
            result = await leadsServices.updateLeadDetails(id, updateData)
        }

        if (!result) {
            return resUtils.sendError(res, 404, 'Lead not found or not updated')
        }

        // Send notifications if images were uploaded
        if (hasDocumentUpdates) {
            const carName = await getVehicleName(existingLead.vehicle)
            const actorName = req.user?.name || req.user?.id || 'Unknown'

            // Send notification asynchronously (don't wait for it)
            sendAdminNotifications(
                id,
                carName,
                documentsUpdate,
                actorName
            ).catch((err) => console.error('Notification failed:', err))
        }

        // Fetch the updated lead to return in response
        const updatedLead = await Leads.findById(id)

        // Prepare response data with all updated fields
        const allUpdatedFields = []

        // Add regular update fields
        if (hasRegularUpdates) {
            allUpdatedFields.push(...Object.keys(updateData))
        }

        // Add document update fields
        if (hasDocumentUpdates) {
            const documentFields = Object.keys(documentsUpdate).map((key) =>
                key.replace('documents.', '')
            )
            allUpdatedFields.push(...documentFields)
        }

        // Remove duplicates
        const uniqueUpdatedFields = [...new Set(allUpdatedFields)]

        const responseData = {
            updated_fields: uniqueUpdatedFields,
            update_summary: {
                regular_updates: hasRegularUpdates
                    ? Object.keys(updateData)
                    : [],
                document_updates: hasDocumentUpdates
                    ? Object.keys(documentsUpdate).map((key) =>
                          key.replace('documents.', '')
                      )
                    : [],
                total_updates: uniqueUpdatedFields.length,
            },
            coordinates_updated:
                finalLatitude && finalLongitude
                    ? {
                          latitude: finalLatitude,
                          longitude: finalLongitude,
                          source: vehicle?.location
                              ? 'vehicle.location'
                              : city
                              ? 'city_parameter'
                              : 'manual_coordinates',
                      }
                    : null,
            lead: {
                _id: updatedLead._id,
                vehicle: updatedLead.vehicle,
                fuel_type: updatedLead.fuel_type,
                transmission_type: updatedLead.transmission_type,
                owner: updatedLead.owner,
                car_type: updatedLead.car_type,
                auction_details: updatedLead.auction_details,
                documents: updatedLead.documents,
                allDocsApproved: updatedLead.allDocsApproved,
                documentStatus: updatedLead.documentStatus,
                updatedAt: updatedLead.updatedAt,
            },
        }

        return resUtils.sendSuccess(
            res,
            200,
            'Lead information updated successfully',
            responseData
        )
    } catch (error) {
        console.error('Error updating lead:', error)

        // Handle specific error types
        if (error.message.includes('must be an image')) {
            return resUtils.sendError(res, 400, error.message)
        }

        return resUtils.sendError(res, 500, 'Internal server error')
    }
}

const markAsSold = async (req, res, next) => {
    try {
        const { id } = req.query
        const userId = req.user?.id || req._id

        // Input validation
        if (!id) {
            return resUtils.sendError(res, 400, 'Lead ID is required')
        }

        if (!userId) {
            return resUtils.sendError(res, 401, 'Authentication required')
        }

        // Mark the lead as sold
        const result = await leadsServices.markAsSold(id, userId)

        return resUtils.sendSuccess(
            res,
            200,
            'Car marked as sold successfully',
            {
                leadId: result._id,
                leadStatus: result.leadStatus,
                soldAt: result.soldAt,
                vehicle: result.vehicle,
            }
        )
    } catch (error) {
        console.error('Error marking lead as sold:', error)

        // Handle specific error types
        if (error.message === 'Lead not found') {
            return resUtils.sendError(res, 404, 'Lead not found')
        }

        if (error.message.includes('Unauthorized')) {
            return resUtils.sendError(res, 403, error.message)
        }

        return resUtils.sendError(res, 500, 'Internal server error')
    }
}

export default {
    createLeads,
    getFuelTypes,
    getTransmissionTypes,
    getLeads,
    likeLeed,
    getLeadDetails,
    getNewlyAddedLeads,
    getBankNames,
    unlikeLeed,
    getAuctionLocations,
    reuploadLeadDoc,
    deleteLeadByUser,
    updateLeadVehicle,
    markAsSold,
}
