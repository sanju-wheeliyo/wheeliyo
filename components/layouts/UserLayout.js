'use client'

import UserHeader from 'components/user/common/UserHeader'
import UserSideDrawer from 'components/user/common/UserSideDrawer'
import Loader from 'components/display/Loader'
import UserContext from 'lib/context/UserContext'
import { useProtectedRoute } from 'lib/hooks/useProtectedAuth'
import React, { useState, useEffect } from 'react'
import { Drawer } from 'antd'
import { useRouter } from 'next/router'

export default function UserLayout({ children }) {
    const [header, setHeader] = useState('')
    const [currentTab, setCurrentTab] = useState(1)
    const [breadcumpsList, setBreadCumpsList] = useState([])
    const [open, setOpen] = useState(false)
    const [placement, setPlacement] = useState('left')
    const [headerIcon, setHeaderIcon] = useState('')
    const [redirecting, setRedirecting] = useState(false)
    const router = useRouter()

    const { authenticated, loading } = useProtectedRoute({
        adminAuthRequired: false,
    })

    const showDrawer = () => {
        setOpen(true)
    }

    const onClose = () => {
        setOpen(false)
    }

    const screenOptions = { headerShown: false }

    useEffect(() => {
        console.log('UserLayout auth state:', {
            authenticated,
            loading,
            redirecting,
        })
        if (!loading && !redirecting) {
            if (!authenticated) {
                console.log('User not authenticated, redirecting to login...')
                setRedirecting(true)
                router.push('/auth/login')
            } else {
                console.log('User authenticated, allowing access to dashboard')
                setRedirecting(false)
            }
        }
    }, [authenticated, loading, redirecting])

    if (redirecting) return <Loader />

    return (
        <UserContext.Provider
            value={{
                header,
                setHeader,
                currentTab,
                setCurrentTab,
                breadcumpsList,
                setBreadCumpsList,
                headerIcon,
                setHeaderIcon,
            }}
        >
            <div className="w-full py-[14px] h-full lg:h-screen flex flex-col lg:flex-row flex-wrap px-4">
                <div className="w-full cursor-pointer pr-3 pb-4 pl-10 lg:pl-4 pt-2 lg:pt-0 flex lg:hidden items-center justify-between relative">
                    <img
                        className="w-full max-w-[120px] lg:max-w-[150px]"
                        src="/assets/logo.svg"
                        alt="Logo"
                    />
                    <span
                        onClick={showDrawer}
                        className="w-6 h-6 block cursor-pointer absolute left-3 top-3"
                    >
                        <img className="w-full" src="/assets/common/menu.svg" />
                    </span>
                </div>
                <div className="w-full lg:w-[228px] hidden lg:flex pr-0 lg:py-[19px] lg:pr-[15px]">
                    <div className="h-[92vh] w-full p-[2px] bg-gradient rounded-2xl fixed max-w-[228px]">
                        <div className="bg-white h-[calc(92vh-4px)] w-full rounded-2xl">
                            <div className="h-full bg-white p-[15px] rounded-2xl side-drawer-img">
                                <UserSideDrawer
                                    placement={placement}
                                    screenOptions
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Drawer
                    title="Navigation"
                    onClose={onClose}
                    open={open}
                    placement={placement}
                >
                    <UserSideDrawer closable={false} onClose={onClose} />
                </Drawer>

                {/* Right Hand Side */}
                <div className="w-full lg:w-[calc(100%-228px)] pl-0 lg:px-[15px]">
                    <div className="w-full">
                        {/* Header */}
                        <UserHeader />
                        {/* Content */}
                        <div className="w-full">{children}</div>
                    </div>
                </div>
            </div>
        </UserContext.Provider>
    )
}
