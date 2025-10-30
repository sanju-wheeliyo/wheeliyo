import API from 'lib/config/axios.config'

export const getNotifications = async (id) =>
    await API.get(`/payments/checkout/${id}`)

