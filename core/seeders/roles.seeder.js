import roleService from 'core/services/role.services'

export default async function seedRoles() {
    await roleService.bulkInsert([
        {
            name: 'Admin',
            description: '',
            type: 'ADMIN',
            role: 'ADMIN',
        },
        {
            name: 'Dealer',
            description: '',
            type: 'USER',
            role: 'DEALER',
        },
    ])
}
