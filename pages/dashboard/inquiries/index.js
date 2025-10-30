import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import UserContext from 'lib/context/UserContext'
import UserLayout from 'components/layouts/UserLayout'

export default function Inquiries() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [inquiries, setInquiries] = useState([])

    useEffect(() => {
        // Set header for the layout
        setHeader('Inquiries')
        setHeaderIcon('/assets/common/sidenav/inquiries-color.svg')

        // Mock data - replace with actual API call
        setInquiries([
            {
                id: 1,
                carName: 'Honda City 2020',
                buyerName: 'Rahul Sharma',
                buyerPhone: '+91 98765 43210',
                message:
                    'Hi, I am interested in your Honda City. Is it still available?',
                status: 'New',
                receivedAt: '2024-01-15 14:30',
            },
            {
                id: 2,
                carName: 'Maruti Swift 2019',
                buyerName: 'Priya Patel',
                buyerPhone: '+91 87654 32109',
                message:
                    'Can you provide more details about the car condition?',
                status: 'Replied',
                receivedAt: '2024-01-14 10:15',
            },
            {
                id: 3,
                carName: 'Hyundai i20 2021',
                buyerName: 'Amit Kumar',
                buyerPhone: '+91 76543 21098',
                message: 'What is the best price you can offer?',
                status: 'Closed',
                receivedAt: '2024-01-13 16:45',
            },
        ])
    }, [setHeader, setHeaderIcon])

    const getStatusColor = (status) => {
        switch (status) {
            case 'New':
                return 'bg-blue-100 text-blue-800'
            case 'Replied':
                return 'bg-green-100 text-green-800'
            case 'Closed':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <>
            <Head>
                <title>Inquiries - Wheeliyo</title>
                <meta name="description" content="Manage your car inquiries" />
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Inquiries
                    </h1>
                    <span className="text-sm text-gray-600">
                        {inquiries.length} inquiries
                    </span>
                </div>

                {/* Inquiries List */}
                <div className="bg-white rounded-2xl shadow-sm">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4">
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    className="border border-gray-200 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {inquiry.carName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                From: {inquiry.buyerName}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                                inquiry.status
                                            )}`}
                                        >
                                            {inquiry.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mb-3">
                                        {inquiry.message}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            <p>Phone: {inquiry.buyerPhone}</p>
                                            <p>
                                                Received: {inquiry.receivedAt}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-1 text-sm bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors">
                                                Reply
                                            </button>
                                            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {inquiries.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No inquiries yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            When people show interest in your cars, you'll see
                            their inquiries here
                        </p>
                        <button className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                            List Your Car
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

Inquiries.layout = UserLayout
