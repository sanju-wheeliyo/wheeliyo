import useApi from './useApi'
import { useContext } from 'react'
import { useRouter } from 'next/router'
import AppContext from 'lib/context/AppContext'
import {
    logout,
    adminLogout,
    meApi,
    sendOtp,
    verifyOtp,
    adminMeApi,
} from 'lib/services/auth.service'
import useToast from './useToast'

const useApp = () => {
    const router = useRouter()
    const { loading, request, setData } = useApi(meApi)
    const API_logoutAPI = useApi(logout)
    const API_sendOtpAPI = useApi(sendOtp)
    const API_verifyOtpAPI = useApi(verifyOtp)

    const { success, error } = useToast()

    const {
        user,
        setUser,
        confirm,
        // loading,
        setConfirm,
        setLoading,
        authenticated,
        setAuthenticated,
    } = useContext(AppContext)

    async function fetchUser() {
        console.log('fetchUser called, pathname:', router.pathname)

        // Use adminMeApi for admin routes
        const isAdminRoute = router.pathname.startsWith('/admin')
        const token = localStorage.getItem('accessToken')

        console.log('Auth check:', {
            isAdminRoute,
            hasToken: !!token,
            tokenLength: token?.length,
        })

        let retVal
        if (isAdminRoute) {
            if (!token) {
                console.log('No token found for admin route')
                setAuthenticated(false)
                setLoading(false)
                return null
            }
            retVal = await adminMeApi(token)
        } else {
            console.log('Calling regular meApi for user route')
            retVal = await request()
        }

        console.log('API response:', retVal)

        if (retVal && retVal?.isError) {
            console.log('API error, setting authenticated to false')
            setAuthenticated(false)
            setLoading(false)
            return null
        } else {
            console.log('API success, setting authenticated to true')
            // Only update state if it's different to prevent unnecessary re-renders
            if (authenticated !== true) {
                setAuthenticated(true)
            }
            if (JSON.stringify(user) !== JSON.stringify(retVal?.data?.data)) {
                setUser(retVal?.data?.data)
            }
            setLoading(false)
            return retVal?.data?.data
        }
    }

    async function logoutUser() {
        setLoading(true)

        // Use adminLogout for admin routes, regular logout for others
        const isAdminRoute = router.pathname.startsWith('/admin')
        let retVal

        if (isAdminRoute) {
            retVal = await adminLogout()
        } else {
            retVal = await API_logoutAPI.request()
        }

        if (retVal && retVal?.isError) {
            setAuthenticated(true)
            setLoading(false)
            return null
        } else {
            // Redirect based on route type
            const isAdminRoute = router.pathname.startsWith('/admin')
            if (isAdminRoute) {
                router.push('/admin/auth/login')
            } else {
                router.push('/auth/login')
            }
            setUser(null)
            setLoading(false)
            setAuthenticated(false)
            localStorage.clear()
            return retVal?.data?.data
        }
    }

    async function handleSendOtp(payload) {
        setLoading(true)
        const retVal = await API_sendOtpAPI.request(payload)
        const email = payload?.value
        if (retVal && retVal?.isError) {
            error(retVal?.errors[0]?.message)
            return null
        } else {
            success(
                `An OTP has been sent to ${email}. Please check your inbox.`
            )
            router.push('/admin/auth/verify-account')
            setLoading(false)
        }

        return retVal
    }

    async function handleVerifyOtp(payload) {
        setLoading(true)
        const retVal = await API_verifyOtpAPI.request(payload)

        if (retVal && retVal?.isError) {
            error(
                'The OTP entered is incorrect or has expired. Please try again.'
            )
            return null
        } else {
            success(
                'OTP has been successfully verified. Please create a new password.'
            )
            router.push('/admin/auth/new-password')
            setLoading(false)
        }

        return retVal?.data?.data
    }

    return {
        user,
        setUser,
        confirm,
        loading,
        fetchUser,
        setConfirm,
        logoutUser,
        setLoading,
        authenticated,
        handleSendOtp,
        handleVerifyOtp,
        setAuthenticated,
    }
}

export default useApp
