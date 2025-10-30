import dbConnect from 'core/config/db.config'
import Leads from 'core/models/leads'
import mongoose from 'mongoose'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    await dbConnect()

    try {
        // Validate owner_count parameter if provided
        if (req.query.owner_count) {
            const validOwnerCounts = ['single', '2', '3', '4_or_more']
            if (!validOwnerCounts.includes(req.query.owner_count)) {
                return res.status(400).json({ 
                    error: `Invalid owner_count parameter. Must be one of: ${validOwnerCounts.join(', ')}` 
                })
            }
        }

        const {
            brand_name,
            model_name,
            variant_name,
            state,
            year_of_manufacture,
            yom_min,
            yom_max,
            fuel_type,
            transmission_type,
            owner_count,
            min_km_driven,
            max_km_driven,
            min_price,
            max_price,
            body_type,
            seller_type,
            search,
            page = 1,
            size = 10,
            lat,
            lng,
        } = req.query

        const pipeline = []

        // If lat/lng provided, add $geoNear as the first stage
        if (lat && lng) {
            pipeline.push({
                $geoNear: {
                    near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: 'distance',
                    maxDistance: req.query.radius ? parseInt(req.query.radius) : 10000, // Allow custom radius, default 10km
                    spherical: true,
                    query: { approved: true }, // Only approved leads
                }
            });
        }

        // Lookups
        pipeline.push(
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
                $lookup: {
                    from: 'fueltypes',
                    localField: 'fuel_type',
                    foreignField: '_id',
                    as: 'fuel_type_obj',
                },
            },
            {
                $lookup: {
                    from: 'transmissiontypes',
                    localField: 'transmission_type',
                    foreignField: '_id',
                    as: 'transmission_type_obj',
                },
            }
        )

        const match = lat && lng ? {} : { approved: true } // $geoNear already filters approved if used

        if (brand_name) match['brand.name'] = new RegExp(brand_name, 'i')
        if (model_name) match['model.name'] = new RegExp(model_name, 'i')
        if (variant_name) match['variant.name'] = new RegExp(variant_name, 'i')
        if (fuel_type) match['fuel_type_obj.name'] = new RegExp(fuel_type, 'i')
        if (transmission_type) match['transmission_type_obj.name'] = new RegExp(transmission_type, 'i')
        if (state) match['vehicle.registered_state'] = new RegExp(state, 'i')
        
        // Handle year filtering - support multiple formats
        if (yom_min || yom_max) {
            // Year range filtering
            const yearConditions = []
            
            if (yom_min && yom_max) {
                // Both min and max are provided - create a range
                const minYear = Number(yom_min)
                const maxYear = Number(yom_max)
                if (!isNaN(minYear) && !isNaN(maxYear)) {
                    yearConditions.push(
                        { 
                            'vehicle.year_of_manufacture': { 
                                $gte: minYear,
                                $lte: maxYear 
                            } 
                        },
                        { 
                            'vehicle.year_of_manufacture': { 
                                $gte: minYear.toString(),
                                $lte: maxYear.toString() 
                            } 
                        }
                    )
                }
            } else if (yom_min) {
                // Only min is provided
                const minYear = Number(yom_min)
                if (!isNaN(minYear)) {
                    yearConditions.push(
                        { 'vehicle.year_of_manufacture': { $gte: minYear } },
                        { 'vehicle.year_of_manufacture': { $gte: minYear.toString() } }
                    )
                }
            } else if (yom_max) {
                // Only max is provided
                const maxYear = Number(yom_max)
                if (!isNaN(maxYear)) {
                    yearConditions.push(
                        { 'vehicle.year_of_manufacture': { $lte: maxYear } },
                        { 'vehicle.year_of_manufacture': { $lte: maxYear.toString() } }
                    )
                }
            }
            
            if (yearConditions.length > 0) {
                // If there's already an $or condition (from search), we need to combine them
                if (match.$or) {
                    const existingOr = match.$or
                    delete match.$or
                    match.$and = [
                        { $or: existingOr },
                        { $or: yearConditions }
                    ]
                } else {
                    match.$or = yearConditions
                }
            }
        } else if (year_of_manufacture) {
            // Handle multiple year values (comma-separated or array)
            let years = []
            
            if (Array.isArray(year_of_manufacture)) {
                // Array format: year_of_manufacture[]=2023&year_of_manufacture[]=2024&year_of_manufacture[]=2025
                years = year_of_manufacture.map(year => Number(year)).filter(year => !isNaN(year))
                years = years.concat(year_of_manufacture.map(year => year.toString()).filter(year => year !== 'NaN'))
            } else if (typeof year_of_manufacture === 'string' && year_of_manufacture.includes(',')) {
                // Comma-separated format: year_of_manufacture=2023,2024,2025
                years = year_of_manufacture.split(',').map(year => Number(year.trim())).filter(year => !isNaN(year))
                years = years.concat(year_of_manufacture.split(',').map(year => year.trim()).filter(year => year !== 'NaN'))
            } else {
                // Single year filtering (backward compatibility)
                const year = Number(year_of_manufacture)
                if (!isNaN(year)) {
                    years = [year, year_of_manufacture.toString()]
                }
            }
            
            if (years.length > 0) {
                match['vehicle.year_of_manufacture'] = { $in: years }
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
                        console.warn('⚠️ Invalid owner_count value:', owner_count)
                        break
                }
            } else {
                console.warn('⚠️ Invalid owner_count parameter. Must be one of:', validOwnerCounts)
            }
        }
        if (body_type) match['vehicle.body_type'] = new RegExp(body_type, 'i')
        if (seller_type) match['seller_type'] = new RegExp(seller_type, 'i')
        // Add city filter
        if (req.query.city) match['vehicle.location'] = new RegExp(req.query.city, 'i')

        if (min_km_driven || max_km_driven) {
            match['vehicle.min_kilometers'] = {}
            if (min_km_driven) match['vehicle.min_kilometers'].$gte = Number(min_km_driven)
            if (max_km_driven) match['vehicle.min_kilometers'].$lte = Number(max_km_driven)
        }

        if (min_price || max_price) {
            match['vehicle.price'] = {}
            if (min_price) match['vehicle.price'].$gte = Number(min_price)
            if (max_price) match['vehicle.price'].$lte = Number(max_price)
        }

        if (search) {
            const regex = new RegExp(search, 'i')
            match.$or = [
                { 'owner.name': regex },
                { 'brand.name': regex },
                { 'model.name': regex },
                { 'variant.name': regex },
                { 'vehicle.number': regex }, // Fixed field name
            ]
        }

        pipeline.push({ $match: match })

        pipeline.push({
            $project: {
                // Fields to include (everything else will be excluded)
                user_id: 1,
                owner: 1,
                vehicle: 1,
                vehicle_number: 1,
                fuel_type_obj: 1,
                transmission_type_obj: 1,
                brand: 1,
                model: 1,
                variant: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        })

        const pageNumber = parseInt(page)
        const pageSize = parseInt(size)
        const skip = (pageNumber - 1) * pageSize

        const results = await Leads.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: pageSize },
        ])

        const totalCount = await Leads.aggregate([
            ...pipeline,
            { $count: 'total' },
        ])

        res.status(200).json({
            message: 'Filtered leads fetched successfully',
            data: results,
            meta: {
                page: pageNumber,
                size: pageSize,
                total: totalCount[0]?.total || 0,
                totalPages: Math.ceil((totalCount[0]?.total || 0) / pageSize),
            },
        })
    } catch (error) {
        console.error('Error in filter API:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
