import { useState } from 'react'

const okStatus = [200, 201]

const useApi = (apiFunc) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    const request = async (...args) => {
        setLoading(true)
        try {
            const response = await apiFunc(...args)

            if (okStatus.includes(response.status)) {
                setLoading(false)
                setData(response.data)
                return {
                    isError: false,
                    data: response.data,
                    errors: [],
                }
            } else {
                setLoading(false)
                setData(null)
                return {
                    isError: true,
                    errors: response.data?.errors || [{ message: response.data?.message || 'Request failed' }],
                }
            }
        } catch (err) {

            setLoading(false)
            setData(null)
            return {
                isError: true,
                errors: err?.response?.data?.errors || [{ message: err?.response?.data?.message || err?.message || 'Network error' }],
            }
        }
    }

    return {
        data,
        loading,
        request,
        setData,
    }
}

export default useApi
