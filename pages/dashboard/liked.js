'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserLayout from 'components/layouts/UserLayout'
import LeadCard from 'components/user/common/LeadCard'
import useApi from 'lib/hooks/useApi'
import { getLeads } from 'lib/services/leads.services'
import useApp from 'lib/hooks/useApp'
import useToast from 'lib/hooks/useToast'

export default function LikedPage() {
    const router = useRouter()
    const { user } = useApp()
    const { error } = useToast()
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [carType, setCarType] = useState('pre-owned')
    const [filters, setFilters] = useState({})

    const API_getLeads = useApi(getLeads)

    const fetchLikedLeads = async () => {
        try {
            setLoading(true)
            const response = await API_getLeads.request({
                isLiked: true,
                car_type: carType,
                size: 50,
                ...filters,
            })

            if (!response.isError) {
                setLeads(response.data?.data || [])
            } else {
                error('Failed to fetch liked leads')
            }
        } catch (err) {
            console.error('Error fetching liked leads:', err)
            error('Failed to fetch liked leads')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLikedLeads()
    }, [carType, filters])

    const handleCarTypeChange = (type) => {
        setCarType(type)
    }

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }))
    }

    return (
        <UserLayout>
            <div className="w-full">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Liked Cars
                        </h1>
                    </div>

                    {/* Car Type Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-full p-1 mb-6">
                        <button
                            onClick={() => handleCarTypeChange('pre-owned')}
                            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                carType === 'pre-owned'
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-600'
                            }`}
                        >
                            Pre-owned
                        </button>
                        <button
                            onClick={() => handleCarTypeChange('auction')}
                            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                carType === 'auction'
                                    ? 'bg-white text-gray-800 shadow-sm'
                                    : 'text-gray-600'
                            }`}
                        >
                            Auction
                        </button>
                    </div>

                    {/* Filters Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                onChange={(e) =>
                                    handleFilterChange({
                                        brand_id: e.target.value,
                                    })
                                }
                            >
                                <option value="">All Brands</option>
                                {/* Add brand options dynamically */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Model
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                onChange={(e) =>
                                    handleFilterChange({
                                        model_id: e.target.value,
                                    })
                                }
                            >
                                <option value="">All Models</option>
                                {/* Add model options dynamically */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                onChange={(e) =>
                                    handleFilterChange({ yom: e.target.value })
                                }
                            >
                                <option value="">All Years</option>
                                {/* Add year options dynamically */}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Leads List */}
                <div className="bg-white rounded-2xl p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                            <span className="ml-3 text-gray-600">
                                Loading liked leads...
                            </span>
                        </div>
                    ) : leads.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {leads.map((lead) => (
                                <LeadCard
                                    key={lead._id}
                                    item={lead}
                                    isFullView={true}
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
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No liked cars yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start exploring cars and like the ones you're
                                interested in to see them here.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard/leads')}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all"
                            >
                                Explore Cars
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    )
}
