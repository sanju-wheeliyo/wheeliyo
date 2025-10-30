import API from '../config/axios.config'

const listQueries = (params) => {
    return API.get('queries/get', { params })
}

const postAQuery = (data) => {
    return API.post('queries/post', data)
}

const deleteAQuery = (id) => {
    return API.delete(`queries/delete?id=${id}`)
}

const carServices = {
    listQueries,
    postAQuery,
    deleteAQuery,
}
export default carServices
