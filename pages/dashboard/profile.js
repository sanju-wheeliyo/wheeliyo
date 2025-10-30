'use client'
import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import UserContext from 'lib/context/UserContext'
import UserLayout from 'components/layouts/UserLayout'
import API from 'lib/config/axios.config'
import useToast from 'lib/hooks/useToast'

// Plan Card Component
function PlanCard({ plan }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-pink-600">
                    {plan?.plan_id?.title || 'Plan'}
                </h3>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                        plan?.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    {plan?.status === 'active' ? 'Active' : 'Expired'}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <span className="text-gray-600 text-sm">Amount:</span>
                    <p className="font-semibold text-gray-900">
                        ₹{plan?.plan_id?.amount || 0}
                    </p>
                </div>
                <div>
                    <span className="text-gray-600 text-sm">Start Date:</span>
                    <p className="font-medium text-gray-900">
                        {plan?.start_date
                            ? new Date(plan.start_date).toLocaleDateString()
                            : '-'}
                    </p>
                </div>
                <div>
                    <span className="text-gray-600 text-sm">End Date:</span>
                    <p className="font-medium text-gray-900">
                        {plan?.end_date
                            ? new Date(plan.end_date).toLocaleDateString()
                            : '-'}
                    </p>
                </div>
            </div>
            {plan?.plan_id?.features && (
                <div>
                    <span className="text-gray-600 text-sm font-medium">
                        Features:
                    </span>
                    <ul className="mt-2 space-y-1">
                        {plan.plan_id.features.map((feature, index) => (
                            <li
                                key={index}
                                className="flex items-center text-sm text-gray-700"
                            >
                                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2"></span>
                                {feature.value}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

// Invoice Card Component
function InvoiceCard({ invoice }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                        {invoice?.title || 'Invoice'}
                    </h4>
                    <p className="text-sm text-gray-600">
                        {invoice?.description || 'Plan subscription'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {invoice?.created_at
                            ? new Date(invoice.created_at).toLocaleDateString()
                            : '-'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                        ₹{invoice?.amount || 0}
                    </p>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice?.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                        {invoice?.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default function Profile() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [user, setUser] = useState({})
    const [activeTab, setActiveTab] = useState('Invoices')
    const [plans, setPlans] = useState([])
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(false)
    const [plansLoading, setPlansLoading] = useState(false)
    const [invoicesLoading, setInvoicesLoading] = useState(false)
    const { error } = useToast()

    useEffect(() => {
        // Set header for the layout
        setHeader('Profile')
        setHeaderIcon('/assets/common/sidenav/profile-color.svg')

        // Only access localStorage on the client side
        if (typeof window !== 'undefined') {
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            setUser(userData)
        }
    }, [])

    useEffect(() => {
        if (activeTab === 'My Plan') {
            fetchPlans()
        } else if (activeTab === 'Invoices') {
            fetchInvoices()
        }
    }, [activeTab])

    const fetchPlans = async () => {
        setPlansLoading(true)
        try {
            const res = await API.get('/api/subscription/my_plans')
            setPlans(res.data?.data || [])
        } catch (err) {
            error('Failed to fetch plans')
        } finally {
            setPlansLoading(false)
        }
    }

    const fetchInvoices = async () => {
        setInvoicesLoading(true)
        try {
            const res = await API.get('/api/invoices/user')
            setInvoices(res.data?.data || [])
        } catch (err) {
            error('Failed to fetch invoices')
        } finally {
            setInvoicesLoading(false)
        }
    }

    const tabs = [
        {
            title: 'Invoices',
            icon: '/assets/common/sidenav/invoiceMenuIcon.svg',
        },
        {
            title: 'My Plan',
            icon: '/assets/common/sidenav/planMenuIconGray.svg',
        },
    ]

    const handleTabChange = (tab) => {
        setActiveTab(tab)
    }

    return (
        <>
            <Head>
                <title>Profile - Wheeliyo</title>
                <meta name="description" content="Your Wheeliyo profile" />
            </Head>

            <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold">
                                    {user.name
                                        ? user.name.charAt(0).toUpperCase()
                                        : 'U'}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">
                                    {user.name || 'User'}
                                </h1>
                                <p className="text-white/80">
                                    {user.email || 'user@example.com'}
                                </p>
                                {user.phone && (
                                    <p className="text-white/80 text-sm">
                                        {user.country_code || '+91'}{' '}
                                        {user.phone}
                                    </p>
                                )}
                                {user.city && user.city !== 'Other' && (
                                    <p className="text-white/80 text-sm">
                                        {user.city}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                (window.location.href =
                                    '/dashboard/profile-edit')
                            }
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex space-x-8 border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.title}
                                onClick={() => handleTabChange(tab.title)}
                                className={`flex items-center space-x-2 pb-3 px-2 relative ${
                                    activeTab === tab.title
                                        ? 'text-pink-600 font-semibold'
                                        : 'text-gray-500'
                                }`}
                            >
                                <img
                                    src={tab.icon}
                                    alt={tab.title}
                                    className="w-5 h-5"
                                />
                                <span>{tab.title}</span>
                                {activeTab === tab.title && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-orange-500"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        {activeTab === 'Invoices' && (
                            <div>
                                {invoicesLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                                        <span className="ml-3 text-gray-600">
                                            Loading invoices...
                                        </span>
                                    </div>
                                ) : invoices.length > 0 ? (
                                    <div className="space-y-4">
                                        {invoices.map((invoice) => (
                                            <InvoiceCard
                                                key={invoice._id}
                                                invoice={invoice}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No invoices yet
                                        </h3>
                                        <p className="text-gray-600">
                                            Your invoices will appear here once
                                            you make a purchase.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'My Plan' && (
                            <div>
                                {plansLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                                        <span className="ml-3 text-gray-600">
                                            Loading plans...
                                        </span>
                                    </div>
                                ) : plans.length > 0 ? (
                                    <div className="space-y-4">
                                        {plans.map((plan) => (
                                            <PlanCard
                                                key={plan._id}
                                                plan={plan}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No active plans
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            You haven't purchased any plans yet.
                                            Explore our plans to get started!
                                        </p>
                                        <a
                                            href="/dashboard/plans"
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all"
                                        >
                                            View Plans
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

Profile.layout = UserLayout
