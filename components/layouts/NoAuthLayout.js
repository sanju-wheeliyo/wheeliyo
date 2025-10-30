'use client'

import { useEffect } from 'react'
import Loader from 'components/display/Loader'
import { useProtectedRoute } from 'lib/hooks/useProtectedAuth'
import { useRouter } from 'next/router'

export default function NoAuthLayout({ children }) {
    const { authenticated, loading } = useProtectedRoute({
        adminAuthRequired: true,
    })
    const router = useRouter()

    // Handle redirect when authenticated
    useEffect(() => {
        if (authenticated && router.pathname === '/admin/auth/login') {
            router.push('/admin/leads/recently-added')
        }
    }, [authenticated, router.pathname])

    // Show loader only if we're still loading and not on login page
    if (loading && router.pathname !== '/admin/auth/login') {
        return <Loader />
    }

    // Show loader while redirecting
    if (authenticated && router.pathname === '/admin/auth/login') {
        return <Loader />
    }

    return <>{children}</>
}
