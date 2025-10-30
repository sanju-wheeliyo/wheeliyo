import API from '../config/axios.config'

const listBrands = (params) => {
    const { limit, type } = params || {}
    return API.get(
        `/cars/makes/list?limit=${limit || 100}&type=${type || 'popular'}`
    )
}
const listModels = (params) => {
    const { limit, make_id, search } = params || {}
    return API.get(
        `/cars/models/list?limit=${limit || 100}&make_id=${
            make_id || ''
        }&search=${search || ''}`
    )
}

const listFuelType = () => {
    return API.get(`/fuel_types`)
}

const listTransmissionType = () => {
    return API.get(`/transmission_types`)
}

const listVariants = (params) => {
    const { limit, model_id, search } = params || {}
    return API.get(
        `/cars/variants/list?limit=${limit || 100}&model_id=${
            model_id || ''
        }&search=${search || ''}`
    )
}
const createLead = (params) => {
    return API.post(`/kylas/lead/create`, params)
}

const createNewLeadV2 = (params) => {
    return API.post(`/admin/leads/create/v2`, params, {
        headers: { 'content-type': 'multipart/form-data' },
    })
}

const updateLead = (id, data) => {
    return API.put(`/admin/lead/update/v2/${id}`, data, {
        headers: { 'content-type': 'multipart/form-data' },
    })
}

const getAllLeads = (params) => {
    return API.get(`/admin/leads`, { params })
}

const deleteALead = (id) => {
    return API.delete(`/admin/lead/delete/${id}`)
}

const approveLeads = (data) => {
    return API.put('/admin/lead/update_status', data)
}

const markAsSold = (leadId) => {
    return API.put(`/lead/mark-sold/${leadId}`)
}

const getPrice = (data) => {
    return API.post('/lead/create', data)
}
const carServices = {
    getPrice,
    listFuelType,
    listBrands,
    listModels,
    listVariants,
    createLead,
    getAllLeads,
    deleteALead,
    createNewLeadV2,
    approveLeads,
    updateLead,
    listTransmissionType,
    markAsSold,
}
export default carServices
