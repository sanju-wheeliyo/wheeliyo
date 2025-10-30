import { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useApp from './useApp'
import Loader from 'components/display/Loader'
import AppContext from 'lib/context/AppContext'

const noAuthRoutes = ['/', '/privacyPolicy', '/termsAndConditions']

export const useProtectedRoute = ({ adminAuthRequired = false }) => {
    const auth = useApp()
    const router = useRouter()
    const isNoAuthRoutes = noAuthRoutes.includes(router.pathname)
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

    const { loading } = useContext(AppContext)

    useEffect(() => {
        // Only fetch user if not already authenticated and not loading and we haven't checked yet
        if (auth?.authenticated === null && !loading && !hasCheckedAuth) {
            setHasCheckedAuth(true)
            auth?.fetchUser()
        }
    }, [auth?.authenticated, loading, hasCheckedAuth])

    // Check if user is authenticated
    useEffect(() => {
        if (!loading && auth?.authenticated !== null && hasCheckedAuth) {
            // For admin routes
            if (adminAuthRequired) {
                if (!auth?.authenticated) {
                    // Don't redirect if we're already on the login page
                    if (router.pathname !== '/admin/auth/login') {
                        router.push('/admin/auth/login')
                    }
                } else if (auth?.user?.role?.type !== 'ADMIN') {
                    router.push('/admin/auth/login')
                }
            } else {
                // For regular user routes
                if (!auth?.authenticated && !isNoAuthRoutes) {
                    router.push('/auth/login')
                }
            }
        }
    }, [
        auth?.authenticated,
        auth?.user?.role?.type,
        loading,
        adminAuthRequired,
        isNoAuthRoutes,
        router.pathname,
        hasCheckedAuth,
    ])

    return {
        ...auth,
        loading,
        isNoAuthRoutes,
    }
}

export const useAuthenticatedRoute = () => {
    const auth = useApp()
    const router = useRouter()

    useEffect(() => {
        if (
            auth?.authenticated === true &&
            auth?.user?.role?.type === 'ADMIN'
        ) {
            router.push('/admin/leads/recently-added')
        }
    }, [auth?.authenticated, auth?.user?.role?.type])

    return auth
}
