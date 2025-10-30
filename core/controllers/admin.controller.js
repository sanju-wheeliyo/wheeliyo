import userServices from 'core/services/user.services'
import roleServices from 'core/services/role.services'
import resUtils from 'core/utils/res.utils'
import leadsServices from 'core/services/leads.services'
import Leads from 'core/models/leads'
import { generateHashPassword } from 'core/utils/password.utils'
import { compressImageAndUpload } from 'core/utils/storage.utils'
import { uploadFile } from 'core/utils/storage.utils'
import { v4 as uuidv4 } from 'uuid'
import { createBulkMessage } from 'core/utils/twilio.utils'
import notificationService from 'core/services/notification.service'
import ParentType from 'core/constants/parent_type.constants'
import EntityTypes from 'core/constants/entity_types.constants'
import AWS from 'aws-sdk'
import City from 'core/models/city'

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

const createNewUser = async (req, res, next) => {
    try {
        const { name, email, password, role_id, phone } = req.body

        const userdetails = await userServices.getUserByEmail(email)
        if (userdetails)
            return resUtils.sendError(res, 400, 'User already registered')

        // Check for phone number uniqueness across ALL users (including deleted ones)
        if (phone) {
            const existingPhoneUser =
                await userServices.checkPhoneNumberUniqueness(phone)
            if (existingPhoneUser) {
                return resUtils.sendError(
                    res,
                    400,
                    'Phone number already exists',
                    [
                        {
                            field: 'phone',
                            message:
                                'This phone number is already registered. Please use a different phone number.',
                        },
                    ]
                )
            }
        }

        const role = await roleServices.getRole(role_id)
        if (!role) {
            console.error('Role not found for role_id:', role_id)
            return resUtils.sendError(res, 400, 'Role not found')
        }
        const hashedPassword = await generateHashPassword(password)

        const userData = {
            email,
            name,
            password: hashedPassword,
            role: role?._id,
            is_verified: true,
            phone,
        }
        await userServices.createUser(userData)

        resUtils.sendSuccess(res, 200, 'User created successfully')
    } catch (error) {
        console.error('Error in createNewUser:', error)
        console.error('Error stack:', error.stack)
        next(error)
    }
}
const createLeads = async (req, res, next) => {
    try {
        const file = req.file
        const user = req.user

        let key = ''
        if (file) {
            const uuid = uuidv4()

            key = `lead_images/${uuid}${file?.filename}`
            const compressKey = `optimizedV2/lead_images/${uuid}${file?.filename}`
            //upload original file in to s3
            const fileUploadRes = await uploadFile(file.path, key)
            if (!fileUploadRes)
                return resUtils.sendError(
                    res,
                    400,
                    'file upload error occurred'
                )
            console.log(fileUploadRes, 'ff')

            //compress image and upload
            // const aa = await compressImageAndUpload({
            //     filePath: file.path,
            //     compressKey,
            // })
            // console.log(aa, 'yy')
        }
        // Thats it, you have your files

        const data = JSON.parse(req.body.data)
        const {
            owner,
            vehicle,
            car_type,
            auction_details,
            fuel_type_id,
            transmission_type_id,
            notes,
        } = data

        const createData = {
            owner,
            vehicle,
            car_type: car_type || 'pre-owned',
            auction_details: auction_details ?? {},
            approved: true,
            image_key: key ?? '',
            ...(fuel_type_id && { fuel_type: fuel_type_id }),
            ...(transmission_type_id && {
                transmission_type: transmission_type_id,
            }),
            notes,
            approvedAt: Date.now(),
        }

        const lead = await leadsServices.create(createData)
        const approvedLeadsCount = await leadsServices.countApprovedLeads()

        if (approvedLeadsCount && approvedLeadsCount % 10 == 0) {
            const premiumDealersNumbers =
                await userServices.getDealersNumberAndNames()
            s

            const created = await createBulkMessage(premiumDealersNumbers)
        }
        console.log('USER CREATING LEAD::', user._id, 'LEAD _ID:', lead._id)
        return resUtils.sendSuccess(
            res,
            200,
            'Leads created successfully',
            lead
        )
    } catch (error) {
        console.log(error, 'eee')
        next(error)
    }
}
const getAllLeadsFilter = async (req, res, next) => {
    try {
        const {
            isApproved,
            brand_id,
            minKilometers,
            maxKilometers,
            yom,
            yom_min,
            yom_max,
            state,
            search,
            sortBy,
            price_min,
            price_max,
            owner_count,
            page = 1,
            limit = 10,
        } = req.query
        let approved
        if (isApproved !== undefined) {
            approved = req.query.isApproved === 'true'
        }

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

        // Validate sortBy parameter
        if (sortBy !== undefined && sortBy !== null) {
            const validSortOptions = [
                'price_low_to_high',
                'price_high_to_low',
                'date_published',
                'distance',
                'relevance',
                'recently-added',
            ]
            if (!validSortOptions.includes(sortBy)) {
                return resUtils.sendError(
                    res,
                    400,
                    `Invalid sortBy parameter. Must be one of: ${validSortOptions.join(
                        ', '
                    )}`
                )
            }
        }

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

        // Validate km_driven parameters
        if (minKilometers !== undefined && minKilometers !== null) {
            const minKm = Number(minKilometers)
            if (isNaN(minKm) || minKm < 0) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid minKilometers parameter. Must be a positive number.'
                )
            }
        }

        if (maxKilometers !== undefined && maxKilometers !== null) {
            const maxKm = Number(maxKilometers)
            if (isNaN(maxKm) || maxKm < 0) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid maxKilometers parameter. Must be a positive number.'
                )
            }
        }

        // Validate km_driven range if both parameters are provided
        if (
            minKilometers !== undefined &&
            minKilometers !== null &&
            maxKilometers !== undefined &&
            maxKilometers !== null
        ) {
            const minKm = Number(minKilometers)
            const maxKm = Number(maxKilometers)
            if (minKm > maxKm) {
                return resUtils.sendError(
                    res,
                    400,
                    'Invalid km_driven range. minKilometers cannot be greater than maxKilometers.'
                )
            }
        }

        const { data, count } = await leadsServices.getLeads(
            approved,
            brand_id,
            minKilometers,
            maxKilometers,
            yom,
            yom_min,
            yom_max,
            state,
            search,
            sortBy,
            page,
            limit,
            price_min,
            price_max,
            owner_count
        )

        const totalPages = Math.ceil((count || 0) / limit)

        const meta = {
            page,
            size: limit,
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(
            res,
            200,
            'leads fetched successfully',
            data,
            meta
        )
    } catch (error) {
        next(error)
    }
}
const updateLeadStatus = async (req, res) => {
    try {
        const { ids, action } = req.body

        if (!ids || !Array.isArray(ids) || !ids.length === 0)
            return resUtils.sendError(res, 400, 'Invalid IDS provided')
        if (!action || !['approve', 'unapprove'].includes(action))
            return resUtils.sendError(res, 400, 'Action not provided')

        if (action === 'approve') {
            await leadsServices.approveLeads(ids)

            // Send notifications to users whose leads were approved
            try {
                for (const leadId of ids) {
                    const leadArr = await leadsServices.getLeadById(leadId)
                    const lead = Array.isArray(leadArr) ? leadArr[0] : leadArr

                    if (lead && lead.user_id) {
                        // Get vehicle details for notification
                        const vehicleInfo =
                            lead.vehicle?.number || 'your vehicle'
                        const brandName = lead.brand?.name || ''
                        const modelName = lead.model?.name || ''
                        const vehicleDisplay =
                            brandName && modelName
                                ? `${brandName} ${modelName}`
                                : vehicleInfo

                        const Meta = {
                            title: 'Lead Approved',
                            body: `Your lead for ${vehicleDisplay} has been approved and is now live on our platform.`,
                        }

                        await notificationService.createNotification({
                            actor: null,
                            notifier: lead.user_id,
                            parent_id: lead._id,
                            parent_type: ParentType.LEAD,
                            entity_type: EntityTypes.LEAD_APPROVAL_STATUS,
                            read: false,
                            meta: Meta,
                            isDeleted: false,
                        })
                    }
                }
            } catch (notifyErr) {
                console.error(
                    'Failed to send lead approval notifications:',
                    notifyErr
                )
            }

            const approvedLeadsCount = await leadsServices.countApprovedLeads()
            console.log('count::', approvedLeadsCount)
            if (approvedLeadsCount && approvedLeadsCount % 10 == 0) {
                const premiumDealersNumbers =
                    await userServices.getDealersNumberAndNames()
                console.log(premiumDealersNumbers, 'dealerss')

                const created = await createBulkMessage(premiumDealersNumbers)
                console.log(created, 'cc')
            }
            return resUtils.sendSuccess(res, 200, 'Successfully approved')
        } else if (action === 'unapprove') {
            await leadsServices.unApproveLeads(ids)
            const approvedLeadsCount = await leadsServices.countApprovedLeads()
            console.log('count::', approvedLeadsCount)
            if (approvedLeadsCount && approvedLeadsCount % 10 == 0) {
                const premiumDealersNumbers =
                    await userServices.getDealersNumberAndNames()
                console.log(premiumDealersNumbers, 'dealerss')

                const created = await createBulkMessage(premiumDealersNumbers)
                console.log(created, 'cc')
            }
            return resUtils.sendSuccess(res, 200, 'Successfully unapproved')
        }
        return resUtils.sendSuccess(res, 200, 'Successfully updated ')
    } catch (error) {
        next(error)
    }
}
const deleteLead = async (req, res) => {
    try {
        const { id } = req.query
        const leadExist = await leadsServices.getLeadById(id)
        if (!leadExist)
            return resUtils.sendError(res, 500, 'Lead does not exist')
        await leadsServices.deleteLead(id)
        return resUtils.sendSuccess(res, 200, 'Lead Successfully Deleted ')
    } catch (error) {
        next(error)
    }
}
const updateLead = async (req, res) => {
    try {
        const file = req.file
        const { id } = req.query
        const leadExist = await leadsServices.getLeadById(id)
        if (!leadExist)
            return resUtils.sendError(res, 500, 'Lead does not exist')
        let key = ''
        if (file) {
            const uuid = uuidv4()

            key = `lead_images/${uuid}${file?.filename}`
            const compressKey = `optimizedV2/lead_images/${uuid}${file?.filename}`
            //upload original file in to s3
            const fileUploadRes = await uploadFile(file.path, key)

            if (!fileUploadRes)
                return resUtils.sendError(
                    res,
                    400,
                    'file upload error occurred'
                )

            //compress image and upload
            // const aa = await compressImageAndUpload({
            //     filePath: file.path,
            //     compressKey,
            // })
            // console.log(aa, 'yy')
        }
        // Thats it, you have your files

        const data = JSON.parse(req.body.data)
        const {
            owner,
            vehicle,
            car_type,
            auction_details,
            fuel_type_id,
            transmission_type_id,
            notes,
        } = data

        const updateData = {
            ...(owner && { owner: owner }),
            ...(vehicle && { vehicle: vehicle }),
            ...(car_type && { car_type: car_type }),
            ...(auction_details && { auction_details: auction_details }),
            ...(key && { image_key: key }),
            ...(fuel_type_id && { fuel_type: fuel_type_id }),
            ...(transmission_type_id && {
                transmission_type: transmission_type_id,
            }),
            ...(notes && { notes: notes }),
        }
        await leadsServices.updateLeadDetails(id, updateData)
        return resUtils.sendSuccess(
            res,
            200,
            'Lead details updated successfully'
        )
    } catch (error) {
        console.log('error while updating lead::', error)
        next(error)
    }
}
const getAllUsersByRoyalty = async (req, res, next) => {
    try {
        const { is_premium, page = 1, size = 10, search } = req.query

        const adminRole = await roleServices.FindRoleDetailsByName('Admin')
        const adminId = adminRole?._id
        const { data, count } = await userServices.getAllUsers(
            is_premium,
            search,
            parseInt(page),
            parseInt(size),
            adminId
        )

        const totalPages = Math.ceil((count || 0) / parseInt(size))

        const meta = {
            page: parseInt(page),
            size: parseInt(size),
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(
            res,
            200,
            'users fetched successfully',
            data,
            meta
        )
    } catch (error) {
        next(error)
    }
}

const verifyUserDocStatus = async (req, res) => {
    console.log('Verifying user document status with body:', req.body)
    try {
        const { _id, document_type, status, rejectionReason } = req.body

        if (!_id || !document_type || !status) {
            return resUtils.sendError(res, 400, 'Missing required fields')
        }

        const allowedDocs = ['aadhar_front', 'aadhar_back', 'photo']
        const allowedStatuses = ['approved', 'rejected']

        if (!allowedDocs.includes(document_type)) {
            return resUtils.sendError(res, 400, 'Invalid document type')
        }

        if (!allowedStatuses.includes(status)) {
            return resUtils.sendError(res, 400, 'Invalid status')
        }

        const user = await userServices.getUserById(_id)
        if (!user) {
            return resUtils.sendError(res, 404, 'User not found')
        }

        user.documents[document_type].status = status
        user.documents[document_type].rejectionReason =
            status === 'rejected' ? rejectionReason : ''

        // Auto-approve overall KYC if all docs are approved
        const docs = user.documents
        const allApproved = ['aadhar_front', 'aadhar_back', 'photo'].every(
            (doc) => docs[doc]?.status === 'approved'
        )
        const anyRejected = ['aadhar_front', 'aadhar_back', 'photo'].some(
            (doc) => docs[doc]?.status === 'rejected'
        )
        if (allApproved) {
            user.is_KYC_verified = 'approved'
        } else if (anyRejected) {
            user.is_KYC_verified = 'rejected'
        } else {
            user.is_KYC_verified = 'pending'
        }

        user.markModified('documents')
        await user.save()

        // Send notification to user about document status
        try {
            // Map document_type to user-friendly name
            let docDisplayName = ''
            if (document_type === 'aadhar_back') docDisplayName = 'aadhar back'
            else if (document_type === 'aadhar_front')
                docDisplayName = 'aadhar front'
            else if (document_type === 'photo') docDisplayName = 'Selfie'
            else docDisplayName = document_type.replace(/_/g, ' ').toLowerCase()

            const Meta = {
                title: `Document ${status}`,
                body: `Your document (${docDisplayName}) has been ${status}${
                    status === 'rejected' && rejectionReason
                        ? `: ${rejectionReason}`
                        : ''
                }.`,
            }
            await notificationService.createNotification({
                actor: null,
                notifier: user._id,
                parent_id: user._id,
                parent_type: ParentType.User,
                entity_type: EntityTypes.USER_DOCUMENT_STATUS,
                read: false,
                meta: Meta,
                isDeleted: false,
            })
        } catch (notifyErr) {
            console.error(
                'Failed to send user document status notification:',
                notifyErr
            )
        }

        return resUtils.sendSuccess(
            res,
            200,
            `Document ${status} successfully`,
            {
                _id,
                document_type,
                status,
                is_KYC_verified: user.is_KYC_verified,
            }
        )
    } catch (error) {
        console.error('Error in document verification:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message },
        ])
    }
}

const verifyLeadDocStatus = async (req, res) => {
    try {
        const { leadId, document_type, status, rejectionReason } = req.body
        if (!leadId || !document_type || !status) {
            return resUtils.sendError(res, 400, 'Missing required fields')
        }
        const allowedDocs = [
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
        const allowedStatuses = ['approved', 'rejected']
        if (!allowedDocs.includes(document_type)) {
            return resUtils.sendError(res, 400, 'Invalid document type')
        }
        if (!allowedStatuses.includes(status)) {
            return resUtils.sendError(res, 400, 'Invalid status')
        }
        const leadArr = await leadsServices.getLeadById(leadId)
        const lead = Array.isArray(leadArr) ? leadArr[0] : leadArr
        if (!lead) {
            return resUtils.sendError(res, 404, 'Lead not found')
        }
        if (!lead.documents || !lead.documents[document_type]) {
            return resUtils.sendError(
                res,
                400,
                'Document type not found in lead'
            )
        }
        lead.documents[document_type].status = status
        lead.documents[document_type].rejectionReason =
            status === 'rejected' ? rejectionReason : ''
        // Check if all required docs are approved
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
        const allApproved = docFields.every(
            (field) => lead.documents[field]?.status === 'approved'
        )
        const anyRejected = docFields.some(
            (field) => lead.documents[field]?.status === 'rejected'
        )

        lead.allDocsApproved = allApproved

        // Update documentStatus and leadApprovalStatus based on document approval status
        if (allApproved) {
            lead.documentStatus = 'approved'
            // Update leadApprovalStatus to approved when all documents are approved
            lead.leadApprovalStatus = 'approved'
        } else if (anyRejected) {
            lead.documentStatus = 'rejected'
            // Also update leadApprovalStatus to rejected when any document is rejected
            lead.leadApprovalStatus = 'rejected'
        } else {
            lead.documentStatus = 'pending'
            // Keep leadApprovalStatus as pending when some documents are still pending
            if (lead.leadApprovalStatus !== 'pending') {
                lead.leadApprovalStatus = 'pending'
            }
        }

        // Save the updated documents, allDocsApproved, documentStatus, and leadApprovalStatus fields
        await leadsServices.updateLeadDetails(leadId, {
            documents: lead.documents,
            allDocsApproved: lead.allDocsApproved,
            documentStatus: lead.documentStatus,
            leadApprovalStatus: lead.leadApprovalStatus,
        })

        // Send notification to lead owner about document status
        try {
            const Meta = {
                title: `Document ${status}`,
                body: `Your car document (${document_type}) has been ${status}${
                    status === 'rejected' && rejectionReason
                        ? `: ${rejectionReason}`
                        : ''
                }.`,
            }
            if (lead.user_id) {
                await notificationService.createNotification({
                    actor: null,
                    notifier: lead.user_id,
                    parent_id: lead._id,
                    parent_type: ParentType.LEAD,
                    entity_type: EntityTypes.LEAD_DOCUMENT_STATUS,
                    read: false,
                    meta: Meta,
                    isDeleted: false,
                })
            }
        } catch (notifyErr) {
            console.error(
                'Failed to send lead document status notification:',
                notifyErr
            )
        }
        return resUtils.sendSuccess(
            res,
            200,
            `Document ${status} successfully`,
            {
                leadId,
                document_type,
                status,
                allDocsApproved: lead.allDocsApproved,
            }
        )
    } catch (error) {
        console.error('Error in lead document verification:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message },
        ])
    }
}
//
const createLeadsV2 = async (req, res, next) => {
    try {
        const files = req.files
        const user = req.user
        let keys = []
        if (files && files.length > 0) {
            for (const file of files) {
                const uuid = uuidv4()

                const key = `lead_images/${uuid}${file?.filename}`
                // const compressKey = `optimizedV2/lead_images/${uuid}${file?.filename}`
                //upload original file in to s3
                const fileUploadRes = await uploadFile(file.path, key)
                if (!fileUploadRes)
                    return resUtils.sendError(
                        res,
                        400,
                        'file upload error occurred'
                    )

                //compress image and upload
                // const aa = await compressImageAndUpload({
                //     filePath: file.path,
                //     compressKey,
                // })
                // console.log(aa, 'yy')
                keys.push(key)
            }
        }

        const data = JSON.parse(req.body.data)

        const {
            owner,
            vehicle,
            car_type,
            auction_details,
            fuel_type_id,
            transmission_type_id,
            notes,
        } = data

        // Validate required fields
        if (!owner?.name) {
            return resUtils.sendError(res, 400, 'Owner name is required')
        }
        if (!owner?.contact) {
            return resUtils.sendError(res, 400, 'Owner contact is required')
        }
        if (!vehicle?.number) {
            return resUtils.sendError(res, 400, 'Vehicle number is required')
        }
        if (!vehicle?.brand_id) {
            return resUtils.sendError(res, 400, 'Vehicle brand is required')
        }
        if (!vehicle?.model_id) {
            return resUtils.sendError(res, 400, 'Vehicle model is required')
        }
        if (!vehicle?.variant_id) {
            return resUtils.sendError(res, 400, 'Vehicle variant is required')
        }

        // Check for duplicate vehicle number
        const vehicleNumber = vehicle?.number?.trim()
        if (!vehicleNumber) {
            return resUtils.sendError(res, 400, 'Vehicle number is required')
        }

        // Check for existing lead with same vehicle number (case-insensitive)
        // Only check leads that are not sold, withdrawn, or expired
        const escapedVehicleNumber = vehicleNumber.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        )
        const existingLead = await Leads.findOne({
            'vehicle.number': {
                $regex: new RegExp(`^${escapedVehicleNumber}$`, 'i'),
            },
            leadStatus: { $nin: ['sold', 'withdrawn', 'expired'] }, // Exclude sold, withdrawn, and expired leads
        })
        if (existingLead) {
            return resUtils.sendError(
                res,
                400,
                'This vehicle number is already listed'
            )
        }

        // Process auction location to coordinates
        let coordinates = null
        if (auction_details?.location) {
            console.log(
                '🔍 Processing auction location:',
                auction_details.location
            )
            const cityCoords = await getCityCoordinates(
                auction_details.location
            )
            if (cityCoords) {
                coordinates = {
                    type: 'Point',
                    coordinates: [cityCoords.longitude, cityCoords.latitude], // GeoJSON format: [lng, lat]
                }
                console.log(
                    '✅ Coordinates found for auction location:',
                    coordinates
                )
            } else {
                console.log(
                    '⚠️ No coordinates found for auction location:',
                    auction_details.location
                )
            }
        }

        const createData = {
            owner,
            vehicle,
            vehicle_number: vehicleNumber, // Use trimmed vehicle number
            car_type: car_type || 'pre-owned',
            auction_details: auction_details ?? {},
            approved: true,
            image_keys: keys ?? [],
            ...(coordinates && { coordinates }), // Add coordinates if found
            ...(fuel_type_id && { fuel_type: fuel_type_id }),
            ...(transmission_type_id && {
                transmission_type: transmission_type_id,
            }),
            notes,
            approvedAt: Date.now(),
        }

        const lead = await leadsServices.create(createData)
        const approvedLeadsCount = await leadsServices.countApprovedLeads()

        if (approvedLeadsCount && approvedLeadsCount % 10 == 0) {
            const premiumDealersNumbers =
                await userServices.getDealersNumberAndNames()

            const created = await createBulkMessage(premiumDealersNumbers)
        }
        console.log('USER CREATING LEAD::', user._id, 'LEAD _ID:', lead._id)
        return resUtils.sendSuccess(
            res,
            200,
            'Leads created successfully',
            lead
        )
    } catch (error) {
        next(error)
    }
}
const updateLeadV2 = async (req, res) => {
    try {
        const files = req.files
        const { id } = req.query

        const leadExist = await leadsServices.getLeadById(id)
        if (!leadExist)
            return resUtils.sendError(res, 500, 'Lead does not exist')
        let keys = []
        if (files && files.length > 0) {
            for (const file of files) {
                const uuid = uuidv4()

                const key = `lead_images/${uuid}${file?.filename}`
                // const compressKey = `optimizedV2/lead_images/${uuid}${file?.filename}`
                //upload original file in to s3
                const fileUploadRes = await uploadFile(file.path, key)
                if (!fileUploadRes)
                    return resUtils.sendError(
                        res,
                        400,
                        'file upload error occurred'
                    )

                //compress image and upload
                // const aa = await compressImageAndUpload({
                //     filePath: file.path,
                //     compressKey,
                // })
                // console.log(aa, 'yy')
                keys.push(key)
            }
        }
        // Thats it, you have your files

        const data = JSON.parse(req.body.data)
        const {
            owner,
            vehicle,
            car_type,
            auction_details,
            fuel_type_id,
            transmission_type_id,
            notes,
            existingImageKeys,
        } = data
        let updatedImageKeys
        if (existingImageKeys) {
            updatedImageKeys = [...existingImageKeys, ...keys]
        }

        // Process auction location to coordinates if auction_details is being updated
        let coordinates = null
        if (auction_details?.location) {
            console.log(
                '🔍 Processing auction location update:',
                auction_details.location
            )
            const cityCoords = await getCityCoordinates(
                auction_details.location
            )
            if (cityCoords) {
                coordinates = {
                    type: 'Point',
                    coordinates: [cityCoords.longitude, cityCoords.latitude], // GeoJSON format: [lng, lat]
                }
                console.log(
                    '✅ Coordinates found for auction location update:',
                    coordinates
                )
            } else {
                console.log(
                    '⚠️ No coordinates found for auction location update:',
                    auction_details.location
                )
            }
        }

        const updateData = {
            ...(owner && { owner: owner }),
            ...(vehicle && { vehicle: vehicle }),
            ...(car_type && { car_type: car_type }),
            ...(auction_details && { auction_details: auction_details }),
            ...(updatedImageKeys && {
                image_keys: updatedImageKeys,
            }),
            ...(coordinates && { coordinates }), // Add coordinates if found
            ...(fuel_type_id && { fuel_type: fuel_type_id }),
            ...(transmission_type_id && {
                transmission_type: transmission_type_id,
            }),
            ...(notes && { notes: notes }),
        }

        // if (deleteImageIds) {
        //     await leadsServices.removeExistingImages(id, deleteImageIds)
        // }

        await leadsServices.updateLeadDetails(id, updateData)
        return resUtils.sendSuccess(
            res,
            200,
            'Lead details updated successfully'
        )
    } catch (error) {
        console.log('error while updating lead::', error)
        next(error)
    }
}
const getUserDetailsById = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) {
            return resUtils.sendError(res, 400, 'User ID is required')
        }
        const user = await userServices.getUserById(id)
        if (!user) {
            return resUtils.sendError(res, 404, 'User not found')
        }
        // Prepare signed URLs for documents
        const docTypes = ['aadhar_front', 'aadhar_back', 'photo']
        const docs = {}
        const s3 = new AWS.S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            signatureVersion: 'v4',
        })
        for (const type of docTypes) {
            const doc = user.documents?.[type]
            if (doc && doc.s3Key) {
                const signedUrl = s3.getSignedUrl('getObject', {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: doc.s3Key,
                    Expires: 86400, // 24 hours
                    ResponseContentDisposition: 'inline',
                })
                docs[type] = {
                    s3Key: doc.s3Key,
                    contentType: doc.contentType,
                    originalName: doc.originalName,
                    status: doc.status,
                    rejectionReason: doc.rejectionReason,
                    url: signedUrl,
                }
            } else {
                docs[type] = null
            }
        }
        const userInfo = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            city: user.city,
            country_code: user.country_code,
            is_verified: user.is_verified,
            is_premium: user.is_premium,
            role: user.role,
            is_KYC_verified: user.is_KYC_verified,
            documents: docs,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
        return resUtils.sendSuccess(res, 200, 'User details fetched', userInfo)
    } catch (error) {
        console.error('Error fetching user details:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message },
        ])
    }
}
export default {
    createNewUser,
    createLeads,
    getAllLeadsFilter,
    deleteLead,
    updateLead,
    getAllUsersByRoyalty,
    verifyUserDocStatus,
    updateLeadStatus,
    createLeadsV2,
    updateLeadV2,
    verifyLeadDocStatus,
    getUserDetailsById,
}
