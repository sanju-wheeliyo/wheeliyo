'use client'

import BreadCumps from 'components/display/BreadCrumps'
import AdminContext from 'lib/context/AdminContext'
import AppContext from 'lib/context/AppContext'
import useApp from 'lib/hooks/useApp'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import AdminProfile from './AdminProfile'
import { getUnreadCount } from 'lib/services/notification.services'

export default function Header() {
    // const { user } = useApp()
    const { header, headerIcon, breadcumpsList, currentTab } =
        useContext(AdminContext)
    const router = useRouter()
    const [notificationCount, setNotificationCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const handleNotificationRoute = () => {
        router.push(`/admin/notification/`)
        // Refresh count after navigation
        setTimeout(() => {
            fetchNotificationCount()
        }, 1000)
    }

    // Fetch notification count
    const fetchNotificationCount = async () => {
        try {
            setLoading(true)
            const count = await getUnreadCount()
            setNotificationCount(count)
        } catch (error) {
            console.error('Failed to fetch notification count:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch count on component mount and set up interval
    useEffect(() => {
        fetchNotificationCount()

        // Refresh count every 30 seconds
        const interval = setInterval(fetchNotificationCount, 30000)

        // Listen for notification updates
        const handleNotificationUpdate = () => {
            fetchNotificationCount()
        }

        window.addEventListener('notification-updated', handleNotificationUpdate)

        return () => {
            clearInterval(interval)
            window.removeEventListener('notification-updated', handleNotificationUpdate)
        }
    }, [])

    return (
        <>
            <header className="w-full flex flex-wrap flex-col md:flex-row items-left md:items-center py-4 px-4 border-b border-solid border-[#efefef] relative">
                <div className="md:w-1/2 pb-4 md:pb-0">
                    <div className="flex items-center gap-2">
                        <img src={headerIcon} />
                        <h1 className="text-gradient text-lg font-[600]">
                            {header}
                        </h1>
                    </div>

                    <BreadCumps
                        items={breadcumpsList}
                        currentTab={currentTab}
                    />
                </div>
                <div className="w-1/2 flex items-center justify-end absolute lg:static right-5 -top-12 -lg:top-10">
                    {/* <div onClick={handleNotificationRoute} className="w-[30px] lg:w-[43px] h-[30px] lg:h-[43px] rounded-full overflow-hidden bg-[#efefef] bg-gradient flex justify-center items-center cursor-pointer">
        
<img
              className="w-full max-w-[15px] lg:max-w-[25px]"
              src="/assets/common/bell.svg"
            />
          </div> */}
                    <span
                        onClick={handleNotificationRoute}
                        className="block cursor-pointer w-[30px] h-[30px] lg:w-[43px] lg:h-[43px] relative"
                    >
                        <img
                            src="/assets/notification/notification.svg"
                            className="w-[30px] h-[30px] lg:w-[43px] lg:h-[43px]"
                        />
                        {/* Notification Badge */}
                        {notificationCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold min-w-[20px]">
                                {notificationCount > 99 ? '99+' : notificationCount}
                            </span>
                        )}
                        {/* Loading indicator */}
                        {loading && notificationCount === 0 && (
                            <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </span>
                        )}
                    </span>
                    <span className="text-[30px] mx-3 lg:mx-5 font-thin flex items-center text-[#E2E5F1] ">
                        <span className="w-[2px] h-[25px] lg:h-[40px] bg-[#E2E5F1] block"></span>
                    </span>
                    <AdminProfile />
                </div>
                {/* <span className="w-5 flex lg:hidden cursor-pointer absolute top-8 right-4">
                    <img className="w-full" src="/assets/common/filter.png" />
                </span> */}
            </header>
        </>
    )
}
