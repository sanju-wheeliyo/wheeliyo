'use client'
import React, { useState } from 'react'
import { formatDateDDMMYYYY, formatToFixed } from 'lib/utils/helper'
import { downloadInvoice } from 'lib/services/userinvoice.services'
import useApi from 'lib/hooks/useApi'
import useToast from 'lib/hooks/useToast'

const InvoiceCard = ({ item }) => {
    const [isInvoiceDownloading, setIsInvoiceDownloading] = useState(false)
    const { success, error } = useToast()
    const API_downloadInvoice = useApi(downloadInvoice)

    const handleDownload = async () => {
        try {
            setIsInvoiceDownloading(true)
            const res = await API_downloadInvoice.request(item?._id)

            if (!res || !res.data) {
                error('Failed to download invoice!')
                return
            }

            const blob = new Blob([res.data], { type: 'application/pdf' })
            const fileName = `invoice_${
                item?.phonepe_merchant_id || Date.now()
            }.pdf`
            const aElement = document.createElement('a')
            aElement.setAttribute('download', fileName)
            const href = URL.createObjectURL(blob)
            aElement.href = href
            aElement.setAttribute('target', '_blank')
            aElement.click()
            URL.revokeObjectURL(href)
            success('Invoice downloaded successfully!')
        } catch (err) {
            console.error('Error downloading invoice:', err)
            error('Failed to download invoice!')
        } finally {
            setIsInvoiceDownloading(false)
        }
    }

    return (
        <div className="flex justify-between items-center bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">
                    {formatDateDDMMYYYY(item?.createdAt)}
                </span>
                <span className="text-lg font-semibold text-gray-700 mb-1">
                    ₹{formatToFixed(item?.amount_total)}
                </span>
                <span className="text-xs text-gray-400">
                    Invoice ID: {item?.phonepe_merchant_id}
                </span>
            </div>

            <div className="flex items-center">
                {isInvoiceDownloading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                ) : (
                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-full hover:bg-gray-50 transition-colors duration-200"
                        title="Download Invoice"
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-gray-600 hover:text-pink-500 transition-colors duration-200"
                        >
                            <path
                                d="M20.1667 9.16658V13.7499C20.1667 18.3333 18.3334 20.1666 13.75 20.1666H8.25004C3.66671 20.1666 1.83337 18.3333 1.83337 13.7499V8.24992C1.83337 3.66659 3.66671 1.83325 8.25004 1.83325H12.8334"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M20.1667 9.16659H16.5C13.75 9.16659 12.8334 8.24992 12.8334 5.49992V1.83325L20.1667 9.16659Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M6.41663 11.9167H11.9166"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M6.41663 15.5833H10.0833"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}

export default InvoiceCard
