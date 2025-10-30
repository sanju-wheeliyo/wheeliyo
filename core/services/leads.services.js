import Leads from 'core/models/leads'
import mongoose from 'mongoose'
import { ensureConnection } from 'core/config/db.config'
const create = async (data) => {
    await ensureConnection()
    return await Leads.create(data)
}
const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const ll = Date.UTC(year, month, day)
    return new Date(Date.UTC(year, month - 1, day))
}
const getLeadsByfilter = async ({
    car_type = 'pre-owned',
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
    page,
    limit,
    exclude_lead_ids,
    // Location-based sorting parameters
    userLatitude,
    userLongitude,
    leadStatus,
    // New parameter to exclude sold leads from public listings
    excludeSoldLeads,
}) => {
    try {
        await ensureConnection()
        const pipeline = [
            {
                $lookup: {
                    from: 'transmissiontypes',
                    localField: 'transmission_type',
                    foreignField: '_id',
                    as: 'transmission_type',
                },
            },
            {
                $lookup: {
                    from: 'fueltypes',
                    localField: 'fuel_type',
                    foreignField: '_id',
                    as: 'fuel_type',
                },
            },
            {
                $lookup: {
                    from: 'makes',
                    localField: 'vehicle.brand_id',
                    foreignField: '_id',
                    as: 'brand',
                },
            },
            {
                $lookup: {
                    from: 'models',
                    localField: 'vehicle.model_id',
                    foreignField: '_id',
                    as: 'model',
                },
            },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'vehicle.variant_id',
                    foreignField: '_id',
                    as: 'variant',
                },
            },
            {
                $unwind: {
                    path: '$transmission_type',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$fuel_type',
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$model', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
            {
                $sort: {
                    approvedAt: -1,
                },
            },
        ]
        let match = {}
        let skip
        if (isLandingPage) {
            skip = (page - 1) * limit + 4
        } else {
            skip = (page - 1) * limit
        }

        // console.log(skip, isLandingPage, limit, page)
        if (car_type) match['car_type'] = car_type

        if (brand_id)
            match['vehicle.brand_id'] = mongoose.Types.ObjectId(brand_id)
        if (model_id)
            match['vehicle.model_id'] = mongoose.Types.ObjectId(model_id)
        if (variant_id)
            match['vehicle.variant_id'] = mongoose.Types.ObjectId(variant_id)

        if (state) match['vehicle.registered_state'] = new RegExp(state, 'i')

        // Handle year filtering - support multiple formats
        if (yom_min || yom_max) {
            // Year range filtering - handle both string and number types
            const yearConditions = []

            if (yom_min && yom_max) {
                // Both min and max are provided - create a range
                const minYear = parseInt(yom_min)
                const maxYear = parseInt(yom_max)
                if (!isNaN(minYear) && !isNaN(maxYear)) {
                    // For range filtering, we need to combine min and max conditions
                    yearConditions.push(
                        {
                            'vehicle.year_of_manufacture': {
                                $gte: minYear,
                                $lte: maxYear,
                            },
                        },
                        {
                            'vehicle.year_of_manufacture': {
                                $gte: minYear.toString(),
                                $lte: maxYear.toString(),
                            },
                        }
                    )
                }
            } else if (yom_min) {
                // Only min is provided
                const minYear = parseInt(yom_min)
                if (!isNaN(minYear)) {
                    yearConditions.push(
                        { 'vehicle.year_of_manufacture': { $gte: minYear } },
                        {
                            'vehicle.year_of_manufacture': {
                                $gte: minYear.toString(),
                            },
                        }
                    )
                }
            } else if (yom_max) {
                // Only max is provided
                const maxYear = parseInt(yom_max)
                if (!isNaN(maxYear)) {
                    yearConditions.push(
                        { 'vehicle.year_of_manufacture': { $lte: maxYear } },
                        {
                            'vehicle.year_of_manufacture': {
                                $lte: maxYear.toString(),
                            },
                        }
                    )
                }
            }

            if (yearConditions.length > 0) {
                // If there's already an $or condition (from search), we need to combine them
                if (match.$or) {
                    const existingOr = match.$or
                    delete match.$or
                    match.$and = [{ $or: existingOr }, { $or: yearConditions }]
                } else {
                    match.$or = yearConditions
                }
            }
        } else if (yom) {
            // Handle multiple year values (comma-separated or array)
            if (Array.isArray(yom)) {
                // Array format: yom[]=2023&yom[]=2024&yom[]=2025
                const years = yom
                    .map((year) => parseInt(year))
                    .filter((year) => !isNaN(year))
                const yearStrings = yom
                    .map((year) => year.toString())
                    .filter((year) => year !== 'NaN')
                if (years.length > 0) {
                    match['vehicle.year_of_manufacture'] = {
                        $in: [...years, ...yearStrings],
                    }
                }
            } else if (typeof yom === 'string' && yom.includes(',')) {
                // Comma-separated format: yom=2023,2024,2025
                const years = yom
                    .split(',')
                    .map((year) => parseInt(year.trim()))
                    .filter((year) => !isNaN(year))
                const yearStrings = yom
                    .split(',')
                    .map((year) => year.trim())
                    .filter((year) => year !== 'NaN')
                if (years.length > 0) {
                    match['vehicle.year_of_manufacture'] = {
                        $in: [...years, ...yearStrings],
                    }
                }
            } else {
                // Single year format: yom=2023
                const year = parseInt(yom)
                if (!isNaN(year)) {
                    match['vehicle.year_of_manufacture'] = {
                        $in: [year, yom.toString()],
                    }
                }
            }
        }

        // Handle approval filtering based on car type
        if (car_type === 'auction') {
            // For auction leads, you can choose to:
            // Option 1: Show only approved auction leads (current behavior)
            match['approved'] = true
            // Option 2: Show all auction leads regardless of approval status
            // (uncomment the line below and comment out the line above)
            // match['approved'] = { $in: [true, false] }
            // Option 3: Show auction leads that are either approved or pending
            // match['approved'] = { $in: [true, null] }
        } else {
            // For pre-owned leads, keep the existing approval requirement
            match['approved'] = true
        }

        // Include sold cars by default to build trust, but allow filtering
        if (leadStatus) {
            // If specific leadStatus is provided, use that
            if (leadStatus === 'active') {
                // Show only active leads (exclude sold, withdrawn, expired)
                match['leadStatus'] = { $in: ['active'] }
            } else if (leadStatus === 'sold') {
                // Show only sold leads
                match['leadStatus'] = 'sold'
            } else if (leadStatus === 'all') {
                // Show all leads regardless of status (no filter)
                // Don't add any leadStatus filter
            } else {
                // For other specific statuses
                match['leadStatus'] = leadStatus
            }
        } else {
            // Default: show active and sold leads (build trust by showing successful sales)
            match['leadStatus'] = { $in: ['active', 'sold'] }
        }

        // Filter out sold leads from public listings if requested
        if (excludeSoldLeads) {
            // Override any existing leadStatus filter to exclude sold cars
            match['leadStatus'] = { $ne: 'sold' }
        }

        // if (isLandingPage) {
        //     match['_id'] = { $nin: exclude_lead_ids }
        // }
        if (isLiked) {
            match['liked_users'] = { $in: [userId] }
        }
        if (auction_location)
            match['auction_details.location'] = new RegExp(
                auction_location,
                'i'
            )

        if (auction_start_date) {
            match['auction_details.start_date'] = {}
            const parsedStartDate = parseDate(auction_start_date)
            match['auction_details.start_date'].$gte = parsedStartDate
        }
        if (auction_end_date) {
            match['auction_details.end_date'] = {}
            const parsedStartDate = parseDate(auction_end_date)
            match['auction_details.end_date'].$lte = parsedStartDate
        }
        if (bank_name) {
            match['auction_details.bank_name'] = new RegExp(bank_name, 'i')
        }
        if (search) {
            const searchRegex = new RegExp(search, 'i')
            match.$or = [
                { 'owner.name': searchRegex },
                { 'model.name': searchRegex },
                { 'brand.name': searchRegex },
            ]
        }

        // Add fuel_type and transmission_type conditions to match before pushing to pipeline
        if (fuel_type_id)
            match['fuel_type._id'] = mongoose.Types.ObjectId(fuel_type_id)
        if (transmission_type_id)
            match['transmission_type._id'] =
                mongoose.Types.ObjectId(transmission_type_id)

        // Add price filtering conditions
        if (price_min || price_max) {
            match['vehicle.price'] = {}
            if (price_min) {
                const minPrice = Number(price_min)
                if (!isNaN(minPrice) && minPrice >= 0) {
                    match['vehicle.price'].$gte = minPrice
                }
            }
            if (price_max) {
                const maxPrice = Number(price_max)
                if (!isNaN(maxPrice) && maxPrice >= 0) {
                    match['vehicle.price'].$lte = maxPrice
                }
            }
            // If only one of min or max is provided, ensure the other condition is valid
            if (price_min && price_max) {
                const minPrice = Number(price_min)
                const maxPrice = Number(price_max)
                if (
                    !isNaN(minPrice) &&
                    !isNaN(maxPrice) &&
                    minPrice > maxPrice
                ) {
                    // Invalid range - min should be less than max
                    console.warn(
                        '⚠️ Invalid price range: min_price > max_price'
                    )
                    match['vehicle.price'] = { $exists: false } // This will match no documents
                }
            }
        }

        // Add owner count filtering conditions
        if (owner_count) {
            const validOwnerCounts = ['single', '2', '3', '4_or_more']
            if (validOwnerCounts.includes(owner_count)) {
                switch (owner_count) {
                    case 'single':
                        match['vehicle.owner_count'] = 1
                        break
                    case '2':
                        match['vehicle.owner_count'] = 2
                        break
                    case '3':
                        match['vehicle.owner_count'] = 3
                        break
                    case '4_or_more':
                        match['vehicle.owner_count'] = { $gte: 4 }
                        break
                    default:
                        // Invalid owner_count value - this shouldn't happen due to validation above
                        console.warn(
                            '⚠️ Invalid owner_count value:',
                            owner_count
                        )
                        break
                }
            } else {
                console.warn(
                    '⚠️ Invalid owner_count parameter. Must be one of:',
                    validOwnerCounts
                )
            }
        }

        // Add km_driven filtering conditions
        if (km_driven_min || km_driven_max) {
            match['vehicle.min_kilometers'] = {}
            if (km_driven_min) {
                const minKm = Number(km_driven_min)
                if (!isNaN(minKm) && minKm >= 0) {
                    match['vehicle.min_kilometers'].$gte = minKm
                }
            }
            if (km_driven_max) {
                const maxKm = Number(km_driven_max)
                if (!isNaN(maxKm) && maxKm >= 0) {
                    match['vehicle.min_kilometers'].$lte = maxKm
                }
            }
            // If only one of min or max is provided, ensure the other condition is valid
            if (km_driven_min && km_driven_max) {
                const minKm = Number(km_driven_min)
                const maxKm = Number(km_driven_max)
                if (!isNaN(minKm) && !isNaN(maxKm) && minKm > maxKm) {
                    // Invalid range - min should be less than max
                    console.warn('⚠️ Invalid km_driven range: min_km > max_km')
                    match['vehicle.min_kilometers'] = { $exists: false } // This will match no documents
                }
            }
        }

        // if (isLandingPage) {
        //     match['_id'] = { $nin: exclude_lead_ids }
        // }
        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match })
        }

        pipeline.push({
            $addFields: {
                isLiked: {
                    $in: [userId, '$liked_users'],
                },
            },
        })

        // Add location-based sorting and distance calculation if user location is provided
        if (userLatitude && userLongitude) {
            // Add distance calculation field using a simpler approach
            // Add distance calculation field using simplified formula (compatible with older MongoDB)
            pipeline.push({
                $addFields: {
                    distance: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ['$coordinates', null] },
                                    { $ne: ['$coordinates.coordinates', null] },
                                ],
                            },
                            then: {
                                $multiply: [
                                    {
                                        $acos: {
                                            $add: [
                                                {
                                                    $multiply: [
                                                        {
                                                            $sin: {
                                                                $multiply: [
                                                                    {
                                                                        $divide:
                                                                            [
                                                                                userLatitude,
                                                                                180,
                                                                            ],
                                                                    },
                                                                    3.14159,
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            $sin: {
                                                                $multiply: [
                                                                    {
                                                                        $divide:
                                                                            [
                                                                                {
                                                                                    $arrayElemAt:
                                                                                        [
                                                                                            '$coordinates.coordinates',
                                                                                            1,
                                                                                        ],
                                                                                },
                                                                                180,
                                                                            ],
                                                                    },
                                                                    3.14159,
                                                                ],
                                                            },
                                                        },
                                                    ],
                                                },
                                                {
                                                    $multiply: [
                                                        {
                                                            $cos: {
                                                                $multiply: [
                                                                    {
                                                                        $divide:
                                                                            [
                                                                                userLatitude,
                                                                                180,
                                                                            ],
                                                                    },
                                                                    3.14159,
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            $cos: {
                                                                $multiply: [
                                                                    {
                                                                        $divide:
                                                                            [
                                                                                {
                                                                                    $arrayElemAt:
                                                                                        [
                                                                                            '$coordinates.coordinates',
                                                                                            1,
                                                                                        ],
                                                                                },
                                                                                180,
                                                                            ],
                                                                    },
                                                                    3.14159,
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            $cos: {
                                                                $subtract: [
                                                                    {
                                                                        $multiply:
                                                                            [
                                                                                {
                                                                                    $divide:
                                                                                        [
                                                                                            userLongitude,
                                                                                            180,
                                                                                        ],
                                                                                },
                                                                                3.14159,
                                                                            ],
                                                                    },
                                                                    {
                                                                        $multiply:
                                                                            [
                                                                                {
                                                                                    $divide:
                                                                                        [
                                                                                            {
                                                                                                $arrayElemAt:
                                                                                                    [
                                                                                                        '$coordinates.coordinates',
                                                                                                        0,
                                                                                                    ],
                                                                                            },
                                                                                            180,
                                                                                        ],
                                                                                },
                                                                                3.14159,
                                                                            ],
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    6371, // Earth's radius in kilometers
                                ],
                            },
                            else: null,
                        },
                    },
                },
            })

            // No distance filtering - include all leads

            // Add a field to handle null distances for proper sorting
            pipeline.push({
                $addFields: {
                    sortDistance: {
                        $cond: {
                            if: { $eq: ['$distance', null] },
                            then: 999999, // Large number to sort null distances last
                            else: '$distance',
                        },
                    },
                },
            })
        }

        pipeline.push({ $project: { liked_users: 0 } })

        // Handle sorting based on sort_by parameter
        let sortCriteria = {}

        if (sort_by) {
            switch (sort_by) {
                case 'price_low_to_high':
                    sortCriteria = { 'vehicle.price': 1 }
                    break
                case 'price_high_to_low':
                    sortCriteria = { 'vehicle.price': -1 }
                    break
                case 'date_published':
                    sortCriteria = { approvedAt: -1 }
                    break
                case 'recently-added':
                    sortCriteria = { createdAt: -1 }
                    break
                case 'distance':
                    // Distance sorting is handled separately when location is provided
                    if (userLatitude && userLongitude) {
                        sortCriteria = { sortDistance: 1 }
                    } else {
                        sortCriteria = { approvedAt: -1 } // fallback
                    }
                    break
                case 'relevance':
                    // Relevance sorting - could be based on multiple factors
                    // For now, default to approval date
                    sortCriteria = { approvedAt: -1 }
                    break
                default:
                    // Default sorting by approval date
                    sortCriteria = { approvedAt: -1 }
                    break
            }
        } else {
            // Default sorting when no sort_by is provided
            if (userLatitude && userLongitude) {
                // When location is provided, prioritize by distance first, then approval date
                sortCriteria = {
                    sortDistance: 1,
                    approvedAt: -1,
                }
            } else {
                sortCriteria = { approvedAt: -1 }
            }
        }

        pipeline.push({ $sort: sortCriteria })

        const res = await Leads.aggregate([
            ...pipeline,
            {
                $skip: skip,
            },
            {
                $limit: parseInt(limit),
            },
        ])
        // console.log(
        //     JSON.stringify([
        //         ...pipeline,
        //         {
        //             $skip: skip,
        //         },
        //         {
        //             $limit: parseInt(limit),
        //         },
        //     ])
        // )

        const count = await Leads.aggregate([
            ...pipeline,
            {
                $count: 'total',
            },
        ])

        return {
            data: res,
            count: count[0]?.total,
        }
    } catch (error) {
        throw error // Re-throw to be handled by controller
    }
}
const getLeads = async (
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
    page,
    limit,
    price_min,
    price_max,
    owner_count
) => {
    try {
        await ensureConnection()
        const pipeline = [
            {
                $lookup: {
                    from: 'transmissiontypes',
                    localField: 'transmission_type',
                    foreignField: '_id',
                    as: 'transmission_type',
                },
            },
            {
                $lookup: {
                    from: 'fueltypes',
                    localField: 'fuel_type',
                    foreignField: '_id',
                    as: 'fuel_type',
                },
            },
            {
                $lookup: {
                    from: 'makes',
                    localField: 'vehicle.brand_id',
                    foreignField: '_id',
                    as: 'brand',
                },
            },
            {
                $lookup: {
                    from: 'models',
                    localField: 'vehicle.model_id',
                    foreignField: '_id',
                    as: 'model',
                },
            },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'vehicle.variant_id',
                    foreignField: '_id',
                    as: 'variant',
                },
            },
            {
                $unwind: {
                    path: '$transmission_type',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$fuel_type',
                    preserveNullAndEmptyArrays: true,
                },
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$model', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
        ]
        let match = {}
        const skip = (page - 1) * limit
        if (isApproved !== undefined) match['approved'] = isApproved

        if (brand_id !== undefined)
            match['vehicle.brand_id'] = mongoose.Types.ObjectId(brand_id)

        // Add km_driven filtering conditions
        if (minKilometers !== undefined || maxKilometers !== undefined) {
            match['vehicle.min_kilometers'] = {}
            if (minKilometers !== undefined) {
                const minKm = Number(minKilometers)
                if (!isNaN(minKm) && minKm >= 0) {
                    match['vehicle.min_kilometers'].$gte = minKm
                }
            }
            if (maxKilometers !== undefined) {
                const maxKm = Number(maxKilometers)
                if (!isNaN(maxKm) && maxKm >= 0) {
                    match['vehicle.min_kilometers'].$lte = maxKm
                }
            }
            // If only one of min or max is provided, ensure the other condition is valid
            if (minKilometers !== undefined && maxKilometers !== undefined) {
                const minKm = Number(minKilometers)
                const maxKm = Number(maxKilometers)
                if (!isNaN(minKm) && !isNaN(maxKm) && minKm > maxKm) {
                    // Invalid range - min should be less than max
                    console.warn('⚠️ Invalid km_driven range: min_km > max_km')
                    match['vehicle.min_kilometers'] = { $exists: false } // This will match no documents
                }
            }
        }

        // Handle year filtering - support multiple formats
        if (yom_min || yom_max) {
            // Year range filtering
            const yearConditions = []

            if (yom_min !== undefined && yom_max !== undefined) {
                // Both min and max are provided - create a range
                const minYear = parseInt(yom_min)
                const maxYear = parseInt(yom_max)
                if (!isNaN(minYear) && !isNaN(maxYear)) {
                    yearConditions.push(
                        {
                            'vehicle.year_of_manufacture': {
                                $gte: minYear,
                                $lte: maxYear,
                            },
                        },
                        {
                            'vehicle.year_of_manufacture': {
                                $gte: minYear.toString(),
                                $lte: maxYear.toString(),
                            },
                        }
                    )
                }
            } else if (yom_min !== undefined) {
                // Only min is provided
                const minYear = parseInt(yom_min)
                if (!isNaN(minYear)) {
                    yearConditions.push(
                        { 'vehicle.year_of_manufacture': { $gte: minYear } },
                        {
                            'vehicle.year_of_manufacture': {
                                $gte: minYear.toString(),
                            },
                        }
                    )
                }
            } else if (yom_max !== undefined) {
                // Only max is provided
                const maxYear = parseInt(yom_max)
                if (!isNaN(maxYear)) {
                    yearConditions.push(
                        { 'vehicle.year_of_manufacture': { $lte: maxYear } },
                        {
                            'vehicle.year_of_manufacture': {
                                $lte: maxYear.toString(),
                            },
                        }
                    )
                }
            }

            if (yearConditions.length > 0) {
                // If there's already an $or condition (from search), we need to combine them
                if (match.$or) {
                    const existingOr = match.$or
                    delete match.$or
                    match.$and = [{ $or: existingOr }, { $or: yearConditions }]
                } else {
                    match.$or = yearConditions
                }
            }
        } else if (yom !== undefined) {
            // Handle multiple year values (comma-separated or array)
            let years = []

            if (Array.isArray(yom)) {
                // Array format: yom[]=2023&yom[]=2024&yom[]=2025
                years = yom
                    .map((year) => parseInt(year))
                    .filter((year) => !isNaN(year))
                years = years.concat(
                    yom
                        .map((year) => year.toString())
                        .filter((year) => year !== 'NaN')
                )
            } else if (typeof yom === 'string' && yom.includes(',')) {
                // Comma-separated format: yom=2023,2024,2025
                years = yom
                    .split(',')
                    .map((year) => parseInt(year.trim()))
                    .filter((year) => !isNaN(year))
                years = years.concat(
                    yom
                        .split(',')
                        .map((year) => year.trim())
                        .filter((year) => year !== 'NaN')
                )
            } else {
                // Single year filtering (backward compatibility)
                const year = parseInt(yom)
                if (!isNaN(year)) {
                    years = [year, yom.toString()]
                }
            }

            if (years.length > 0) {
                match['vehicle.year_of_manufacture'] = { $in: years }
            }
        }

        if (state !== undefined) match['vehicle.registered_state'] = state

        // Add price filtering conditions
        if (price_min !== undefined || price_max !== undefined) {
            match['vehicle.price'] = {}
            if (price_min !== undefined) {
                const minPrice = Number(price_min)
                if (!isNaN(minPrice) && minPrice >= 0) {
                    match['vehicle.price'].$gte = minPrice
                }
            }
            if (price_max !== undefined) {
                const maxPrice = Number(price_max)
                if (!isNaN(maxPrice) && maxPrice >= 0) {
                    match['vehicle.price'].$lte = maxPrice
                }
            }
            // If both min and max are provided, ensure valid range
            if (price_min !== undefined && price_max !== undefined) {
                const minPrice = Number(price_min)
                const maxPrice = Number(price_max)
                if (
                    !isNaN(minPrice) &&
                    !isNaN(maxPrice) &&
                    minPrice > maxPrice
                ) {
                    // Invalid range - min should be less than max
                    console.warn(
                        '⚠️ Invalid price range: min_price > max_price'
                    )
                    match['vehicle.price'] = { $exists: false } // This will match no documents
                }
            }
        }

        // Add owner count filtering conditions
        if (owner_count !== undefined) {
            const validOwnerCounts = ['single', '2', '3', '4_or_more']
            if (validOwnerCounts.includes(owner_count)) {
                switch (owner_count) {
                    case 'single':
                        match['vehicle.owner_count'] = 1
                        break
                    case '2':
                        match['vehicle.owner_count'] = 2
                        break
                    case '3':
                        match['vehicle.owner_count'] = 3
                        break
                    case '4_or_more':
                        match['vehicle.owner_count'] = { $gte: 4 }
                        break
                    default:
                        // Invalid owner_count value - this shouldn't happen due to validation above
                        console.warn(
                            '⚠️ Invalid owner_count value:',
                            owner_count
                        )
                        break
                }
            } else {
                console.warn(
                    '⚠️ Invalid owner_count parameter. Must be one of:',
                    validOwnerCounts
                )
            }
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i')
            match.$or = [{ 'owner.name': searchRegex }]
        }

        // Apply sorting based on sortBy parameter
        if (sortBy) {
            switch (sortBy) {
                case 'price_low_to_high':
                    pipeline.push({ $sort: { 'vehicle.price': 1 } })
                    break
                case 'price_high_to_low':
                    pipeline.push({ $sort: { 'vehicle.price': -1 } })
                    break
                case 'date_published':
                    pipeline.push({ $sort: { approvedAt: -1 } })
                    break
                case 'recently-added':
                    pipeline.push({ $sort: { createdAt: -1 } })
                    break
                case 'distance':
                    // TODO: Implement distance-based sorting when location data is available
                    pipeline.push({ $sort: { approvedAt: -1 } })
                    break
                case 'relevance':
                    // TODO: Implement relevance-based sorting (could be based on search score or other factors)
                    pipeline.push({ $sort: { approvedAt: -1 } })
                    break
                default:
                    // Default sorting by approval date (newest first)
                    pipeline.push({ $sort: { approvedAt: -1 } })
                    break
            }
        } else {
            // Default sorting based on approval status
            if (isApproved) {
                pipeline.push({ $sort: { approvedAt: -1 } })
            } else {
                pipeline.push({ $sort: { createdAt: -1 } })
            }
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match })
        }

        pipeline.push({ $project: { liked_users: 0 } })

        const res = await Leads.aggregate([
            ...pipeline,
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: parseInt(limit),
            },
        ])
        const count = await Leads.aggregate([
            ...pipeline,
            {
                $count: 'total',
            },
        ])

        return {
            data: res,
            count: count[0]?.total,
        }
    } catch (error) {
        console.log('error while fetching leads::', error)
    }
}
const getLeadById = async (leadId) => {
    await ensureConnection()
    const pipeline = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(leadId),
            },
        },
        {
            $lookup: {
                from: 'transmissiontypes',
                localField: 'transmission_type',
                foreignField: '_id',
                as: 'transmission_type',
            },
        },
        {
            $lookup: {
                from: 'fueltypes',
                localField: 'fuel_type',
                foreignField: '_id',
                as: 'fuel_type',
            },
        },
        {
            $lookup: {
                from: 'makes',
                localField: 'vehicle.brand_id',
                foreignField: '_id',
                as: 'brand',
            },
        },
        {
            $lookup: {
                from: 'models',
                localField: 'vehicle.model_id',
                foreignField: '_id',
                as: 'model',
            },
        },
        {
            $lookup: {
                from: 'variants',
                localField: 'vehicle.variant_id',
                foreignField: '_id',
                as: 'variant',
            },
        },
        {
            $unwind: {
                path: '$transmission_type',
                preserveNullAndEmptyArrays: true,
            },
        },
        { $unwind: { path: '$fuel_type', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$model', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                owner: 1,
                vehicle: 1,
                documents: 1,
                auction_details: 1,
                car_type: 1,
                brand: 1,
                model: 1,
                variant: 1,
                fuel_type: 1,
                transmission_type: 1,
                image_key: 1,
                image_keys: 1,
                coordinates: 1,
                approved: 1,
                approvedAt: 1,
                allDocsApproved: 1,
                documentStatus: 1,
                leadStatus: 1,
                soldAt: 1,
                user_id: 1,
            },
        },
    ]

    return await Leads.aggregate([...pipeline])
}
const likeLeed = async (leadId, userId) => {
    await ensureConnection()
    return await Leads.findByIdAndUpdate(
        leadId,
        { $addToSet: { liked_users: userId } },
        { new: true }
    )
}

const approveLeads = async (ids) => {
    await ensureConnection()
    const approved_date = new Date()
    return await Leads.updateMany(
        { _id: { $in: ids } },
        {
            $set: {
                approved: true,
                approvedAt: approved_date,
                leadApprovalStatus: 'approved',
            },
        }
    )
}
const unApproveLeads = async (ids) => {
    await ensureConnection()
    return await Leads.updateMany(
        { _id: { $in: ids } },
        { $set: { approved: false, leadApprovalStatus: 'rejected' } }
    )
}
const deleteLead = async (id) => {
    await ensureConnection()
    return await Leads.deleteOne({ _id: id })
}
const updateLeadDetails = async (id, data) => {
    await ensureConnection()
    return await Leads.findByIdAndUpdate({ _id: id }, data, { new: true })
}
const newlyAddedLeads = async (car_type = 'pre-owned', userId) => {
    await ensureConnection()
    const pipeline = [
        {
            $match: {
                car_type: car_type,
                approved: true,
            },
        },
        {
            $lookup: {
                from: 'transmissiontypes',
                localField: 'transmission_type',
                foreignField: '_id',
                as: 'transmission_type',
            },
        },
        {
            $lookup: {
                from: 'fueltypes',
                localField: 'fuel_type',
                foreignField: '_id',
                as: 'fuel_type',
            },
        },
        {
            $lookup: {
                from: 'makes',
                localField: 'vehicle.brand_id',
                foreignField: '_id',
                as: 'brand',
            },
        },
        {
            $lookup: {
                from: 'models',
                localField: 'vehicle.model_id',
                foreignField: '_id',
                as: 'model',
            },
        },
        {
            $lookup: {
                from: 'variants',
                localField: 'vehicle.variant_id',
                foreignField: '_id',
                as: 'variant',
            },
        },
        {
            $unwind: {
                path: '$transmission_type',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$fuel_type',
                preserveNullAndEmptyArrays: true,
            },
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$model', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } },
    ]
    pipeline.push({
        $addFields: {
            isLiked: {
                $in: [userId, '$liked_users'],
            },
        },
    })

    pipeline.push({ $sort: { approvedAt: -1 } })
    return await Leads.aggregate([
        ...pipeline,
        {
            $limit: parseInt(4),
        },
    ])
}
const getBankNamesFromLeads = async () => {
    await ensureConnection()
    return await Leads.distinct('auction_details.bank_name')
}
const unlikeLeed = async (leadId, userId) => {
    await ensureConnection()
    return await Leads.findByIdAndUpdate(
        leadId,
        {
            $pull: { liked_users: userId },
        },
        { new: true }
    )
}
const findAllAuctionLocations = async () => {
    await ensureConnection()
    return await Leads.distinct('auction_details.location')
}
const countApprovedLeads = async () => {
    await ensureConnection()
    return await Leads.count({ approved: true })
}
const findCarTypes = async () => {
    await ensureConnection()
    return await Leads.distinct('car_type')
}
const findUniqueAuctionLocations = async () => {
    await ensureConnection()
    const pipeline = [
        [
            {
                $project: {
                    location: {
                        $trim: {
                            input: { $toLower: '$auction_details.location' },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$location',
                },
            },
            {
                $project: {
                    _id: 0,
                    location: '$_id',
                },
            },
        ],
    ]

    const result = await Leads.aggregate(pipeline)
    const filteredLocations = result
        .map((item) => item.location)
        .filter((location) => location !== '')

    return filteredLocations
}
const findUniqueBankNames = async () => {
    await ensureConnection()
    const pipeline = [
        [
            {
                $project: {
                    bank_name: {
                        $trim: {
                            input: { $toLower: '$auction_details.bank_name' },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$bank_name',
                },
            },
            {
                $project: {
                    _id: 0,
                    bank_name: '$_id',
                },
            },
        ],
    ]
    const result = await Leads.aggregate(pipeline)
    const filteredBankNames = result
        .map((item) => item.bank_name)
        .filter((bank_name) => bank_name !== '')

    return filteredBankNames
}

const migrateImageKeys = async () => {
    try {
        await ensureConnection()
        const leads = await Leads.find({ image_key: { $exists: true } })

        for (const lead of leads) {
            const imageKey = lead?.image_key?.trim()
            if (imageKey && imageKey !== 'undefined') {
                lead.image_keys = [imageKey]
            } else {
                console.log(
                    `Skipping lead with ID: ${lead._id}, invalid or empty image_key`
                )
            }
            await lead.save()
        }
    } catch (error) {
        console.error(`Error during migration:`, error)
    }
}
// const removeExistingImages = async (leadId, imagekeysToRemove) => {
//     try {
//         const result = await Leads.updateOne(
//             {
//                 _id: leadId,
//             },
//             {
//                 $pull: {
//                     image_keys: { $in: imagekeysToRemove },
//                 },
//             }
//         )
//         return result
//     } catch (error) {
//         console.log(error, 'eee')
//     }
// }

const markAsSold = async (leadId, userId) => {
    try {
        await ensureConnection()
        const lead = await Leads.findById(leadId)

        if (!lead) {
            throw new Error('Lead not found')
        }

        // Check if the user owns this lead
        if (lead.user_id && lead.user_id.toString() !== userId.toString()) {
            throw new Error(
                'Unauthorized: You can only mark your own leads as sold'
            )
        }

        // Update the lead status to sold
        const soldAt = new Date()
        const result = await Leads.findByIdAndUpdate(
            leadId,
            {
                $set: {
                    leadStatus: 'sold',
                    soldAt: soldAt,
                },
            },
            { new: true }
        )

        return result
    } catch (error) {
        throw error
    }
}

export default {
    create,
    getLeadsByfilter,
    getLeadById,
    likeLeed,
    getLeads,
    approveLeads,
    unApproveLeads,
    deleteLead,
    updateLeadDetails,
    newlyAddedLeads,
    getBankNamesFromLeads,
    unlikeLeed,
    findAllAuctionLocations,
    countApprovedLeads,
    findCarTypes,
    findUniqueAuctionLocations,
    findUniqueBankNames,
    migrateImageKeys,
    markAsSold,
}
