import fuelTypeService from 'core/services/fuelType.service'

export default async function seedFuelType() {
    await fuelTypeService.bulkInsert([
        {
            name: 'Petrol',
        },
        {
            name: 'Diesel',
        },
        {
            name: 'CNG',
        },
        {
            name: 'Electric',
        },
    ])
}
