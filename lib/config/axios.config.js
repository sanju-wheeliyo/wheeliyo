import axios from 'axios'
import { regenerateToken } from 'lib/services/auth.service'

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_END_POINT || '/api/',
    timeout: 100000,
    headers: {
        'content-Type': 'application/json',
    },
})

API.interceptors.request.use(
    async (config) => {
        const newConfig = { ...config }
        const token = localStorage.getItem('accessToken')

        console.log('API Request:', {
            url: config.url,
            method: config.method,
            hasToken: !!token,
            tokenLength: token?.length,
        })

        newConfig.headers = {
            ...newConfig.headers,
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        }
        return newConfig // Return the new config object
    },
    (error) => {
        console.log('====================================')
        console.log('⚠️ Server connection error ->', error)
        console.log('====================================')
    }
)

API.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        })
        return response
    },
    async (error) => {
        console.log('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
        })

        const originalRequest = error.config
        // console.log('ERROR:::', error)
        if (error.response.status === 498 && !originalRequest._retry) {
            originalRequest._retry = true
            const currentRefreshToken = localStorage.getItem('refreshToken')

            const params = { refreshToken: currentRefreshToken }
            const res = await regenerateToken(params)

            const { refreshToken, jwtToken } = res.data?.data || {}
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('accessToken', jwtToken)
            return API(originalRequest)
        }
        return Promise.reject(error)
    }
)

export default API
