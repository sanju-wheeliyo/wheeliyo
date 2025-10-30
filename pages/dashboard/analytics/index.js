import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import UserContext from 'lib/context/UserContext'
import UserLayout from 'components/layouts/UserLayout'

export default function Analytics() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [analytics, setAnalytics] = useState({})

    useEffect(() => {
        // Set header for the layout
        setHeader('Analytics')
        setHeaderIcon('/assets/common/sidenav/analytics-color.svg')

        // Mock data - replace with actual API call
        setAnalytics({
            totalViews: 1247,
            totalInquiries: 23,
            avgViewsPerCar: 415,
            topPerformingCar: 'Honda City 2020',
            monthlyViews: [120, 180, 220, 190, 250, 287],
            monthlyInquiries: [2, 3, 5, 4, 6, 3],
        })
    }, [setHeader, setHeaderIcon])

    const stats = [
        {
            name: 'Total Views',
            value: analytics.totalViews,
            change: '+12%',
            changeType: 'positive',
        },
        {
            name: 'Total Inquiries',
            value: analytics.totalInquiries,
            change: '+8%',
            changeType: 'positive',
        },
        {
            name: 'Avg Views per Car',
            value: analytics.avgViewsPerCar,
            change: '+5%',
            changeType: 'positive',
        },
        {
            name: 'Top Performing Car',
            value: analytics.topPerformingCar,
            change: 'Honda City 2020',
            changeType: 'neutral',
        },
    ]

    return (
        <>
            <Head>
                <title>Analytics - Wheeliyo</title>
                <meta
                    name="description"
                    content="View your car listing analytics"
                />
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Analytics
                    </h1>
                    <div className="flex space-x-2">
                        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                            <option>Last 30 days</option>
                            <option>Last 3 months</option>
                            <option>Last 6 months</option>
                            <option>Last year</option>
                        </select>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div
                            key={stat.name}
                            className="bg-white rounded-2xl p-6 shadow-sm"
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
                                <div
                                    className={`text-sm ${
                                        stat.changeType === 'positive'
                                            ? 'text-green-600'
                                            : stat.changeType === 'negative'
                                            ? 'text-red-600'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Views Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Monthly Views
                        </h3>
                        <div className="h-64 flex items-end justify-between space-x-2">
                            {analytics.monthlyViews?.map((value, index) => (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center"
                                >
                                    <div
                                        className="w-full bg-gradient-to-t from-secondary to-[#F55C33] rounded-t"
                                        style={{
                                            height: `${(value / 300) * 200}px`,
                                        }}
                                    ></div>
                                    <span className="text-xs text-gray-600 mt-2">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                        </div>
                    </div>

                    {/* Inquiries Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Monthly Inquiries
                        </h3>
                        <div className="h-64 flex items-end justify-between space-x-2">
                            {analytics.monthlyInquiries?.map((value, index) => (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center"
                                >
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t"
                                        style={{
                                            height: `${(value / 10) * 200}px`,
                                        }}
                                    ></div>
                                    <span className="text-xs text-gray-600 mt-2">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                        </div>
                    </div>
                </div>

                {/* Performance Tips */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Performance Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-4 h-4 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    High-Quality Photos
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Cars with better photos get 40% more views
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Regular Updates
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Update your listings weekly for better
                                    visibility
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-4 h-4 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Location Matters
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Include your exact location for local
                                    searches
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-4 h-4 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Competitive Pricing
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Price your car competitively for more
                                    inquiries
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

Analytics.layout = UserLayout
