import transmissionTypeServices from 'core/services/transmissionType.services'

export default async function seedTransmissionTypes() {
    await transmissionTypeServices.bulkInsert([
        {
            name: 'Manual',
        },
        {
            name: 'Automatic',
        },
    ])
}
