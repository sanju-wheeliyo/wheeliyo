'use client'
import React, { useContext, useEffect, useState } from 'react'
import UserLayout from 'components/layouts/UserLayout'
import UserContext from 'lib/context/UserContext'
import { getMyInvoices } from 'lib/services/userinvoice.services'
import useApi from 'lib/hooks/useApi'
import InvoiceCard from 'components/user/common/InvoiceCard'
import Loader from 'components/display/Loader'

export default function InvoicesPage() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const API_getInvoices = useApi(getMyInvoices)

    useEffect(() => {
        // Set header for the layout
        setHeader('Invoices')
        setHeaderIcon('/assets/common/sidenav/invoiceMenuIcon.svg')

        // Fetch invoices
        fetchInvoices()
    }, [setHeader, setHeaderIcon])

    const fetchInvoices = async () => {
        try {
            setLoading(true)
            const res = await API_getInvoices.request()
            if (res?.data?.data) {
                setInvoices(res.data.data)
            }
        } catch (error) {
            console.error('Error fetching invoices:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <UserLayout>
            <div className="w-full">
                <div className="w-full bg-white rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Invoices
                        </h1>
                        <button
                            onClick={fetchInvoices}
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-secondary to-[#F55C33] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader />
                        </div>
                    ) : invoices?.length > 0 ? (
                        <div className="space-y-4">
                            {invoices.map((item) => (
                                <InvoiceCard key={item._id} item={item} />
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
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No invoices available
                            </h3>
                            <p className="text-gray-500">
                                You don't have any invoices yet. Invoices will
                                appear here after successful payments.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    )
}
