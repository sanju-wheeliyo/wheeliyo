import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import {
    TruckIcon,
    HeartIcon,
    DocumentTextIcon,
    EyeIcon,
    PhoneIcon,
    UserIcon,
} from '@heroicons/react/24/outline'
import UserContext from 'lib/context/UserContext'
import UserLayout from 'components/layouts/UserLayout'

export default function Dashboard() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [user, setUser] = useState({})
    const [stats, setStats] = useState({
        totalCars: 0,
        favorites: 0,
        documents: 0,
        views: 0,
        inquiries: 0,
    })

    useEffect(() => {
        // Set header for the layout
        setHeader('Dashboard')
        setHeaderIcon('/assets/common/sidenav/dashboard-color.svg')

        // Only access localStorage on the client side
        if (typeof window !== 'undefined') {
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            setUser(userData)
        }

        // Mock stats - replace with actual API calls
        setStats({
            totalCars: 3,
            favorites: 12,
            documents: 5,
            views: 156,
            inquiries: 8,
        })
    }, [])

    const statCards = [
        {
            name: 'My Cars',
            value: stats.totalCars,
            icon: TruckIcon,
            color: 'bg-blue-500',
            href: '/dashboard/cars',
        },
        {
            name: 'Favorites',
            value: stats.favorites,
            icon: HeartIcon,
            color: 'bg-red-500',
            href: '/dashboard/favorites',
        },
        {
            name: 'Documents',
            value: stats.documents,
            icon: DocumentTextIcon,
            color: 'bg-green-500',
            href: '/dashboard/documents',
        },
        {
            name: 'Total Views',
            value: stats.views,
            icon: EyeIcon,
            color: 'bg-purple-500',
            href: '/dashboard/analytics',
        },
        {
            name: 'Inquiries',
            value: stats.inquiries,
            icon: PhoneIcon,
            color: 'bg-yellow-500',
            href: '/dashboard/inquiries',
        },
    ]

    const recentActivities = [
        {
            id: 1,
            type: 'car_added',
            message: 'Added new car listing - Honda City 2020',
            time: '2 hours ago',
        },
        {
            id: 2,
            type: 'inquiry_received',
            message: 'Received inquiry for your Maruti Swift',
            time: '1 day ago',
        },
        {
            id: 3,
            type: 'document_uploaded',
            message: 'Uploaded RC book for Hyundai i20',
            time: '2 days ago',
        },
    ]

    return (
        <>
            <Head>
                <title>Dashboard - Wheeliyo</title>
                <meta name="description" content="Your Wheeliyo dashboard" />
            </Head>

            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-secondary to-[#F55C33] rounded-2xl p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">
                        Welcome back, {user.name || 'User'}! 👋
                    </h1>
                    <p className="text-white/80">
                        Here&apos;s what&apos;s happening with your car listings
                        today.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {statCards.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.name}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() =>
                                    (window.location.href = stat.href)
                                }
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {stat.name}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-gradient-to-r from-secondary to-[#F55C33]">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Recent Activity and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start space-x-3"
                                >
                                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <TruckIcon className="w-5 h-5 text-secondary" />
                                    <span className="text-sm font-medium">
                                        Add New Car
                                    </span>
                                </div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <DocumentTextIcon className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium">
                                        Upload Documents
                                    </span>
                                </div>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5 text-secondary" />
                                    <span className="text-sm font-medium">
                                        Update Profile
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

Dashboard.layout = UserLayout
