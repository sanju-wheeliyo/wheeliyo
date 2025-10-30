import mongoose from 'mongoose'
import Role from 'core/models/roles'

const CreateRoles = async (data) => {
    return await Role.create(data)
}

const FindRoleDetailsByName = async (role_name) => {
    return await Role.findOne({ name: role_name })
}

const bulkInsert = async (data) => {
    const res = await Role.insertMany(data)
    return res
}
const getRole = async (id) => {
    return await Role.findOne({ _id: mongoose.Types.ObjectId(id) })
}
const getAdminId = async () => {
    return await Role.findOne({ name: 'Admin' })
}
export default { bulkInsert, FindRoleDetailsByName, CreateRoles, getRole }
