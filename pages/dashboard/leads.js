'use client'
import React, { useContext, useEffect, useState } from 'react'
import UserLayout from 'components/layouts/UserLayout'
import UserContext from 'lib/context/UserContext'
import { getLeads } from 'lib/services/leads.services'
import useApi from 'lib/hooks/useApi'
import LeadCard from 'components/user/common/LeadCard'
import Loader from 'components/display/Loader'

export default function LeadsPage() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        car_type: 'pre-owned',
        page: 1,
        size: 10,
    })
    const API_getLeads = useApi(getLeads)

    useEffect(() => {
        // Set header for the layout
        setHeader('Leads')
        setHeaderIcon('/assets/common/sidenav/leadsMenuIconGray.svg')

        // Fetch leads
        fetchLeads()
    }, [setHeader, setHeaderIcon])

    const fetchLeads = async () => {
        try {
            setLoading(true)
            const res = await API_getLeads.request(filters)
            if (res?.data?.data) {
                setLeads(res.data.data)
            }
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
    }

    const handleCarTypeToggle = () => {
        const newCarType =
            filters.car_type === 'pre-owned' ? 'auction' : 'pre-owned'
        handleFilterChange({ car_type: newCarType })
    }

    return (
        <UserLayout>
            <div className="w-full">
                <div className="w-full bg-white rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Leads
                        </h1>
                        <button
                            onClick={fetchLeads}
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-secondary to-[#F55C33] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    {/* Car Type Toggle */}
                    <div className="mb-6">
                        <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
                            <button
                                onClick={() =>
                                    handleFilterChange({
                                        car_type: 'pre-owned',
                                    })
                                }
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    filters.car_type === 'pre-owned'
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                Pre-owned
                            </button>
                            <button
                                onClick={() =>
                                    handleFilterChange({ car_type: 'auction' })
                                }
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    filters.car_type === 'auction'
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                Auction
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                        </div>
                    ) : leads?.length > 0 ? (
                        <div className="space-y-4">
                            {leads.map((item) => (
                                <LeadCard
                                    key={item._id}
                                    item={item}
                                    isFullView={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="text-gray-400"
                                >
                                    <path
                                        d="M6.94629 1.97583V4.32964"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M13.223 1.97583V4.32964"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M6.16162 10.6067H12.4385"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M6.16162 13.7449H10.0846"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M13.2231 3.15283C15.8358 3.29406 17.1461 4.29051 17.1461 7.97815V12.827C17.1461 16.0596 16.3615 17.6759 12.4384 17.6759H7.73082C3.8078 17.6759 3.02319 16.0596 3.02319 12.827V7.97815C3.02319 4.29051 4.33348 3.30191 6.94622 3.15283H13.2231Z"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No leads available
                            </h3>
                            <p className="text-gray-500">
                                {filters.car_type === 'pre-owned'
                                    ? 'No pre-owned cars available at the moment.'
                                    : 'No auction cars available at the moment.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    )
}
