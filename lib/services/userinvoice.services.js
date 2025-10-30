import API from 'lib/config/axios.config'

export const userInvoice = async (params) =>
    await API.get(`/admin/invoices/user`, { params })

export const getMyInvoices = async () => await API.get('/invoices/user')

export const downloadInvoice = async (id) =>
    await API.get(`/invoices/download/${id}`, {
        responseType: 'arraybuffer',
    })
