import API from 'lib/config/axios.config'

export const DownloadInvoice = async (id) =>
    await API.get(`/invoices/download/${id}`)
