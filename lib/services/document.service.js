import API from 'lib/config/axios.config'

export const getDocumentBlob = async (leadId, docType) => {
    try {
        const response = await API.get(`/lead/document/${docType}`, {
            params: { leadId, type: docType },
            responseType: 'blob'
        })
        
        // Create a blob URL from the response
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const blobUrl = URL.createObjectURL(blob)
        
        return blobUrl
    } catch (error) {
        console.error('Error fetching document:', error)
        throw error
    }
}

export const revokeDocumentBlob = (blobUrl) => {
    if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
    }
}

export const verifyDocument = async (leadId, documentType, status, rejectionReason = '') => {
    try {
        const response = await API.put('/admin/verify/verify-doc', {
            leadId,
            document_type: documentType,
            status,
            rejectionReason
        })
        
        return response.data
    } catch (error) {
        console.error('Error verifying document:', error)
        throw error
    }
}
