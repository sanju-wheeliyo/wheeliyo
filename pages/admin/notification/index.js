
'use client'

import React, { useContext, useEffect, useMemo, useState } from 'react'
import AdminLayout from 'components/layouts/AdminLayout'
import NotificationCard from 'components/admin/notification/NotificationCard'
import NotificationCardGrey from 'components/admin/notification/NotificationCardGrey'
import {
    getAllNotifications,
    getOldNotifications,
    readAllNotifications,
} from 'lib/services/notification.services'
import ListingContextProvider from 'lib/hooks/ListingContextProvider'
import { ListingContext } from 'lib/context/ListingContext'
import AdminContext from 'lib/context/AdminContext'
import useApi from 'lib/hooks/useApi'
import { useRouter } from 'next/router'

function Notification() {
    const { setHeader, setHeaderIcon, setBreadCumpsList, setCurremtTab } = useContext(AdminContext)
    const [tab, setTab] = useState('new')
    const router = useRouter()
    const API_readAllNotification = useApi(readAllNotifications)

    const tabs = useMemo(() => [
        { key: 'new', label: 'New notifications' },
        { key: 'old', label: 'Old notifications' },
    ], [])

    // Breadcrumbs + header
    useEffect(() => {
        setBreadCumpsList([
            { title: 'Home', id: 1 },
            { title: 'Notifications', id: 2 },
            { title: tab === 'new' ? 'New notifications' : 'Old notifications', id: 3 },
        ])
        setCurremtTab(3)
        setHeader('Notifications')
        setHeaderIcon('/assets/common/notification.svg')
    }, [tab, router])

    // Load tab from localStorage
    useEffect(() => {
        const storedTab = localStorage.getItem('notificationTab')
        if (storedTab) setTab(storedTab)
    }, [])

    // On unmount, mark all as read
    useEffect(() => {
        return () => {
            handleReadAllNotification()
            localStorage.setItem('notificationTab', 'new')
        }
    }, [])

    const handleTabChange = (newTab) => {
        setTab(newTab)
        localStorage.setItem('notificationTab', newTab)
    }

    const handleReadAllNotification = async () => {
        const res = await API_readAllNotification.request()
        if (res?.isError) {
            console.warn('Failed to mark all notifications as read')
        } else {
            // Trigger notification count refresh
            window.dispatchEvent(new Event('notification-updated'))
        }
    }

    const isNewTab = tab === 'new'
    const fetchAPI = isNewTab ? getAllNotifications : getOldNotifications

    return (
        <div className="w-full">
            <NotificationTabs tabs={tabs} activeTab={tab} onChange={handleTabChange} />

            <ListingContextProvider
                getItemsAPI={fetchAPI}
                cacheKey={['notifications', tab]}
                otherParams={{ size: 10 }}
                resultsKey="data"
            >
                <NotificationList />
            </ListingContextProvider>
        </div>
    )
}
Notification.layout = AdminLayout
export default Notification

// ✅ Tabs Component
function NotificationTabs({ tabs, activeTab, onChange }) {
    return (
        <div className="pl-2 flex gap-4 items-center">
            {tabs.map(({ key, label }) => (
                <h3
                    key={key}
                    className={`my-4 text-[#565973] cursor-pointer box-shadow-light px-4 py-2 rounded-md ${activeTab === key ? 'bg-gradient text-white' : ''
                        }`}
                    onClick={() => onChange(key)}
                >
                    {label}
                </h3>
            ))}
        </div>
    )
}

// ✅ Renders notifications from context
function NotificationList() {
    const { items, loading, error } = useContext(ListingContext)

    // if (loading) return <p>Loading notifications...</p>
    // if (error) return <p className="text-red-500">Error loading: {error.message}</p>
    if (!items || items.length === 0) return <p className="text-gray-400"> No notifications found.</p>

    return (
        <div className="flex flex-col gap-4">
            {items.map((item) => (
                <NotificationCardComponent key={item._id} item={item} />
            ))}
        </div>
    )
}

// ✅ Renders correct card based on read status
function NotificationCardComponent({ item }) {
    return item?.read ? (
        <NotificationCardGrey item={item} />
    ) : (
        <NotificationCard item={item} />
    )
}
