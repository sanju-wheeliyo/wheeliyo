import API from 'lib/config/axios.config'
import axios from 'axios'

export const login = async (params) => {
    return await API.post('/admin/auth/login', params)
}

export const logout = (params) => {
    return API.post(`/auth/logout`, params)
}

export const adminLogout = (params) => {
    return API.post(`/admin/auth/logout`, params)
}

export const verifyOtp = (params) => {
    return API.post('/auth/verify_otp', params)
}

export const resetPassword = (params) => {
    return API.post('/auth/reset_password', params)
}

export const sendOtp = (params) => {
    return API.post('/auth/send_otp', params)
}

export const regenerateToken = (params) => {
    return API.post('/auth/regenerate_token', params)
}

export const meApi = () => {
    return API.get(`/auth/me`)
}

export const adminMeApi = async (token) => {
    return await API.get('/admin/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
    })
}
