import API from 'lib/config/axios.config'

export const getLeads = async (params) =>
    await API.get('/lead/get_all', { params })

export const getLeadDetails = async (id) => await API.get(`/lead/${id}`)

export const likeLead = async (id) => await API.post(`/lead/like/${id}`)

export const unlikeLead = async (id) => await API.post(`/lead/unlike/${id}`)

export const getNewlyAddedLeads = async (params) =>
    await API.get('/lead/newly_added', { params })
