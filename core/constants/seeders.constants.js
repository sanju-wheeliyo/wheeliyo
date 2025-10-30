import seedRoles from 'core/seeders/roles.seeder'
import seedFuelType from 'core/seeders/fuelType.seeder'
import seedTransmissionTypes from 'core/seeders/transmissionTypes.seeder'
// import seedPlans from 'core/seeders/createPlans.seeder'
import seedDummyPlans from 'core/seeders/createDummyPlan'
import seedCountries from 'core/seeders/countries.seeder'
import createPlans from 'core/seeders/createPlans.seeder'
import planPricingUpdate from 'core/seeders/planPricingUpdate.seeder'
import seedMigrateImageKeys from 'core/seeders/migrateImageKeys'
import planPricingUpdateV2 from 'core/seeders/planPricingUpdateV2.seeder'

const SEED_ROLES = 'SEED_ROLES'
const SEED_FUEL_TYPE = 'SEED_FUEL_TYPE'
const SEED_TRANSMISSION_TYPE = 'SEED_TRANSMISSION_TYPE'
const SEED_PLANS = 'SEED_PLANS'
const SEED_DUMMY_PLANS = 'SEED_DUMMY_PLANS'
const SEED_COUTRIES = 'SEED_COUTRIES'
const SEED_UPDATE_PLAN_PRICING = 'SEED_UPDATE_PLAN_PRICING'
const SEED_MIGRATE_IMAGE_KEYS = 'SEED_MIGRATE_IMAGE_KEYS'
const SEED_UPDATE_PLAN_PRICING_V2 = 'SEED_UPDATE_PLAN_PRICING_V2'
export default [
    {
        name: SEED_ROLES,
        func: seedRoles,
        description: 'Inserting admin, dealer rolls',
    },
    {
        name: SEED_FUEL_TYPE,
        func: seedFuelType,
        description: 'Inserting fuel types to db',
    },
    {
        name: SEED_TRANSMISSION_TYPE,
        func: seedTransmissionTypes,
        description: 'Inserting transmission types to db',
    },
    {
        name: SEED_PLANS,
        func: createPlans,
        description: 'Creating plans for razorpay and db  ',
    },
    {
        name: SEED_COUTRIES,
        func: seedCountries,
        description: 'Inserting countries to db',
    },
    {
        name: SEED_UPDATE_PLAN_PRICING,
        func: planPricingUpdate,
        description: 'Updating plan pricing',
    },
    {
        name: SEED_MIGRATE_IMAGE_KEYS,
        func: seedMigrateImageKeys,
        description:
            'Seeder for migrating the image key field to image keys array of leads model',
    },
    {
        name: SEED_UPDATE_PLAN_PRICING_V2,
        func: planPricingUpdateV2,
        description: 'Updating plan pricing of 3 months plan',
    },
]
