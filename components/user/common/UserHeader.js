'use client'

import BreadCumps from 'components/display/BreadCrumps'
import UserContext from 'lib/context/UserContext'
import useApp from 'lib/hooks/useApp'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import UserProfile from './UserProfile'
import useApi from 'lib/hooks/useApi'
import { getUnreadCount } from 'lib/services/notification.services'

export default function UserHeader() {
    const { header, headerIcon, breadcumpsList, currentTab } =
        useContext(UserContext)
    const router = useRouter()
    const [user, setUser] = useState({})
    const [unreadCount, setUnreadCount] = useState(0)
    const [loadingCount, setLoadingCount] = useState(true)

    const API_getUnreadCount = useApi(getUnreadCount)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            setUser(userData)
        }
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const res = await API_getUnreadCount.request()
            if (res?.data?.success) {
                setUnreadCount(res.data.data?.count || 0)
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err)
        } finally {
            setLoadingCount(false)
        }
    }

    useEffect(() => {
        fetchUnreadCount()
    }, [])

    const handleNotificationRoute = () => {
        router.push(`/dashboard/notifications`)
    }

    return (
        <>
            <header className="w-full flex flex-wrap flex-col md:flex-row items-left md:items-center py-4 px-4 border-b border-solid border-[#efefef] relative">
                <div className="md:w-1/2 pb-4 md:pb-0">
                    <div className="flex items-center gap-2">
                        {headerIcon && (
                            <img src={headerIcon} alt="Header Icon" />
                        )}
                        <h1 className="text-gradient text-lg font-[600]">
                            {header || 'Dashboard'}
                        </h1>
                    </div>

                    <BreadCumps
                        items={breadcumpsList}
                        currentTab={currentTab}
                    />
                </div>
                <div className="w-1/2 flex items-center justify-end absolute lg:static right-5 -top-12 -lg:top-10">
                    <div className="relative">
                        <span
                            onClick={handleNotificationRoute}
                            className="block cursor-pointer w-[30px] h-[30px] lg:w-[43px] lg:h-[43px] relative"
                        >
                            <img
                                src="/assets/notification/notification.svg"
                                className="w-[30px] h-[30px] lg:w-[43px] lg:h-[43px]"
                            />
                            {!loadingCount && unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                            )}
                        </span>
                    </div>
                    <span className="text-[30px] mx-3 lg:mx-5 font-thin flex items-center text-[#E2E5F1] ">
                        <span className="w-[2px] h-[25px] lg:h-[40px] bg-[#E2E5F1] block"></span>
                    </span>
                    <UserProfile />
                </div>
            </header>
        </>
    )
}
