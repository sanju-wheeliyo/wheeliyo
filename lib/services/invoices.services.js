import API from '../config/axios.config'

const getInvoices = async (params) =>
    await API.get('/invoices/list', { params })
const downloadInvoice = async (id) =>
    await API.get(`/invoices/download/${id}`, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
    })

const invoicesServices = {
    getInvoices,
    downloadInvoice,
}
export default invoicesServices
