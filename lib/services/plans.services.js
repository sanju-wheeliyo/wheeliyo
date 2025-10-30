import API from 'lib/config/axios.config'

// export const getNotifications = async (id) =>
//     await API.get(`/payments/checkout/${id}`)

export const getPlans = async (params) =>
    await API.get('/get_all_plans', { params })

export const makPayment = async (body) =>
    await API.post('/phonepe/checkout', body)

export const paymentStatus = async (body) =>
    await API.post('/phonepe/status', body)
