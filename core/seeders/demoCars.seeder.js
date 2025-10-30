import makeService from 'core/services/make.services'
import modelService from 'core/services/model.services'
import leadsService from 'core/services/leads.services'
import fuelTypeService from 'core/services/fuelType.service'
import transmissionTypeService from 'core/services/transmissionType.services'

export default async function seedDemoCars() {
    try {
        console.log('🚗 Starting demo cars seeding...')

        // Get fuel types and transmission types
        const fuelTypes = await fuelTypeService.getAllFuelType()
        const transmissionTypes = await transmissionTypeService.getAllTransmissionTypes()

        console.log(`📊 Found ${fuelTypes.length} fuel types and ${transmissionTypes.length} transmission types`)

        // Create makes
        const makes = []
        const makeNames = ['Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Mahindra', 'Tata']

        for (const makeName of makeNames) {
            const existingMake = await makeService.find({ name: makeName })
            if (!existingMake) {
                const make = await makeService.create({
                    name: makeName,
                    popular: 85 + Math.floor(Math.random() * 15),
                    images: []
                })
                makes.push(make)
                console.log(`✅ Created make: ${makeName}`)
            } else {
                makes.push(existingMake)
                console.log(`ℹ️ Make already exists: ${makeName}`)
            }
        }

        // Create models
        const models = []
        const modelNames = ['Swift', 'i20', 'City', 'Innova', 'XUV500', 'Nexon']

        for (const make of makes) {
            for (const modelName of modelNames) {
                const existingModel = await modelService.find({ name: modelName, make_id: make._id })
                if (!existingModel) {
                    const model = await modelService.create({
                        name: modelName,
                        make_id: make._id,
                        popular: 80 + Math.floor(Math.random() * 20),
                        images: []
                    })
                    models.push(model)
                    console.log(`✅ Created model: ${modelName} for ${make.name}`)
                } else {
                    models.push(existingModel)
                    console.log(`ℹ️ Model already exists: ${modelName} for ${make.name}`)
                }
            }
        }

        // Create sample leads with fuel types and transmission types
        const sampleLeads = []
        for (let i = 0; i < 20; i++) {
            const randomMake = makes[Math.floor(Math.random() * makes.length)]
            const makeModels = models.filter(m => m.make_id.toString() === randomMake._id.toString())
            const randomModel = makeModels[Math.floor(Math.random() * makeModels.length)]
            const randomFuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)]
            const randomTransmissionType = transmissionTypes[Math.floor(Math.random() * transmissionTypes.length)]

            const lead = {
                owner: {
                    name: `Demo Owner ${i + 1}`,
                    contact: `98765${String(i).padStart(5, '0')}`
                },
                vehicle: {
                    number: `DL${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + (i % 26))}${String(i).padStart(4, '0')}`,
                    brand_id: randomMake._id,
                    model_id: randomModel._id,
                    year_of_manufacture: `${2018 + (i % 6)}`,
                    registered_state: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat'][i % 5],
                    min_kilometers: 10000 + (i * 5000),
                    max_kilometers: 15000 + (i * 5000),
                    price: 500000 + (i * 50000),
                    location: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Ahmedabad'][i % 5],
                    owner_count: 1 + (i % 3),
                    notes: `Demo car ${i + 1} - Well maintained, single owner, excellent condition. ${randomFuelType.name} engine with ${randomTransmissionType.name} transmission.`
                },
                status: 'approved',
                approved: true,
                fuel_type: randomFuelType._id,
                transmission_type: randomTransmissionType._id,
                documents: {
                    rc: { status: 'approved' },
                    puc: { status: 'approved' },
                    insurance: { status: 'approved' },
                    car_front: { status: 'approved' },
                    car_back: { status: 'approved' },
                    car_left: { status: 'approved' },
                    car_right: { status: 'approved' }
                }
            }

            const createdLead = await leadsService.create(lead)
            sampleLeads.push(createdLead)
            console.log(`✅ Created lead ${i + 1}: ${randomMake.name} ${randomModel.name} (${randomFuelType.name}, ${randomTransmissionType.name})`)
        }

        console.log('✅ Sample leads created:', sampleLeads.length)
        console.log('🎉 Demo cars seeding completed successfully!')
        console.log(`📊 Created: ${makes.length} makes, ${models.length} models, ${sampleLeads.length} sample leads`)

        return { makes, models, leads: sampleLeads }
    } catch (error) {
        console.error('❌ Error seeding demo cars:', error)
        throw error
    }
}
