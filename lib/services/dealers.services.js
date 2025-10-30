import API from '../config/axios.config'

const getDealers = (params) => {
    return API.get('/admin/dealers/get_all', { params })
}

const dealersServices = {
    getDealers,
}
export default dealersServices
