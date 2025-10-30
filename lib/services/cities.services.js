import API from '../config/axios.config'

const listCities = (params) => {
    const { page = 1, size = 10, search, ...otherParams } = params || {}

    return API.get('cities/get', {
        params: {
            page,
            size,
            search,
            ...otherParams
        }
    })
}

const postACity = (data) => {
    return API.post('cities/post', data)
}

const updateACity = (data) => {
    return API.put('cities/update', data)
}

const deleteACity = (id) => {
    return API.delete(`cities/delete?id=${id}`)
}

const carServices = {
    listCities,
    postACity,
    updateACity,
    deleteACity,
}
export default carServices
