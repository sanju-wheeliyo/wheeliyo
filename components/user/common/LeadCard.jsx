'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { FileImage, formatDateDDMMYYYY } from 'lib/utils/helper'
import { likeLead, unlikeLead } from 'lib/services/leads.services'
import useApi from 'lib/hooks/useApi'
import useToast from 'lib/hooks/useToast'

const LeadCard = ({ item, isFullView = false }) => {
    // console.log("ITEM :",item)
    const router = useRouter()
    const { success, error } = useToast()
    const [isLiked, setIsLiked] = useState(item?.isLiked || false)
    const API_likeLead = useApi(likeLead)
    const API_unlikeLead = useApi(unlikeLead)

    const handleLike = async (e) => {
        e.stopPropagation()
        try {
            if (isLiked) {
                await API_unlikeLead.request(item._id)
                setIsLiked(false)
                success('Removed from favorites!')
            } else {
                await API_likeLead.request(item._id)
                setIsLiked(true)
                success('Added to favorites!')
            }
        } catch (err) {
            console.error('Error toggling like:', err)
            error('Failed to update favorite status!')
        }
    }

    const handleCardClick = () => {
        router.push(`/dashboard/lead/${item._id}`)
    }

    // Use signed URL from API if available, otherwise fallback to direct S3 URL or placeholder
    const image =
        item?.image_key_signed_url ||
        (item?.image_key
            ? FileImage(item.image_key)
            : '/assets/leads/car-one.png')
    const isAuction = item?.car_type === 'auction'

    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                isFullView ? 'p-5' : 'p-4'
            }`}
            onClick={handleCardClick}
        >
            <div className="flex gap-4">
                {/* Image Section */}
                <div className="relative">
                    <img
                        src={image}
                        alt={`${item?.brand?.name || 'Car'} ${
                            item?.model?.name || ''
                        }`}
                        className={`object-cover rounded-lg ${
                            isFullView ? 'w-36 h-24' : 'w-32 h-20'
                        }`}
                    />

                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors duration-200"
                        title={
                            isLiked
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                        }
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={
                                isLiked ? 'text-pink-500' : 'text-gray-400'
                            }
                        >
                            <path
                                d="M8 13.5L6.5 12.1C3.5 9.3 1.5 7.4 1.5 5C1.5 2.8 3.2 1 5.5 1C6.4 1 7.3 1.3 8 1.9C8.7 1.3 9.6 1 10.5 1C12.8 1 14.5 2.8 14.5 5C14.5 7.4 12.5 9.3 9.5 12.1L8 13.5Z"
                                fill={isLiked ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    {/* Auction Badge */}
                    {isAuction && (
                        <div className="absolute bottom-2 left-2">
                            <span className="px-2 py-1 bg-gradient-to-r from-secondary to-[#F55C33] text-white text-xs font-semibold rounded-full">
                                Auction
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-between">
                    <div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
                            <div>
                                <strong>Brand:</strong>{' '}
                                {item?.brand?.name || 'N/A'}
                            </div>
                            <div>
                                <strong>Model:</strong>{' '}
                                {item?.model?.name || 'N/A'}
                            </div>
                            <div>
                                <strong>Variant:</strong>{' '}
                                {item?.variant?.name || 'N/A'}
                            </div>
                            <div>
                                <strong>Location:</strong>{' '}
                                {item?.vehicle?.registered_state || 'N/A'}
                            </div>
                            <div>
                                <strong>Driven Km:</strong>
                                {item?.vehicle?.min_kilometers &&
                                item?.vehicle?.max_kilometers
                                    ? `${item.vehicle.min_kilometers} - ${item.vehicle.max_kilometers} km`
                                    : 'N/A'}
                            </div>
                            <div>
                                <strong>Year:</strong>{' '}
                                {item?.vehicle?.year_of_manufacture || 'N/A'}
                            </div>
                        </div>

                        {isAuction && item?.auction_details && (
                            <div className="space-y-1 mb-2">
                                <p className="text-xs text-gray-500">
                                    {item.auction_details.bank_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {item.auction_details.location}
                                </p>
                                {item.auction_details.start_date && (
                                    <p className="text-xs text-gray-500">
                                        {formatDateDDMMYYYY(
                                            item.auction_details.start_date
                                        )}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="text-xs text-gray-500">
                            {formatDateDDMMYYYY(item?.createdAt)}
                        </div>

                        {isAuction && item?.auction_details?.emd_amount && (
                            <div className="text-right">
                                <span className="text-xs text-gray-500">
                                    EMD
                                </span>
                                <p className="text-sm font-semibold text-gray-800">
                                    ₹{item.auction_details.emd_amount}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LeadCard
