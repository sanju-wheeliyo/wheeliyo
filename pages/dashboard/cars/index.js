import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import UserContext from 'lib/context/UserContext'
import UserLayout from 'components/layouts/UserLayout'

export default function Cars() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [cars, setCars] = useState([])

    useEffect(() => {
        // Set header for the layout
        setHeader('My Cars')
        setHeaderIcon('/assets/common/sidenav/cars-color.svg')

        // Mock data - replace with actual API call
        setCars([
            {
                id: 1,
                name: 'Honda City 2020',
                price: '₹8,50,000',
                status: 'Active',
                views: 45,
                inquiries: 3,
            },
            {
                id: 2,
                name: 'Maruti Swift 2019',
                price: '₹5,20,000',
                status: 'Active',
                views: 32,
                inquiries: 2,
            },
            {
                id: 3,
                name: 'Hyundai i20 2021',
                price: '₹7,80,000',
                status: 'Sold',
                views: 67,
                inquiries: 5,
            },
        ])
    }, [setHeader, setHeaderIcon])

    return (
        <>
            <Head>
                <title>My Cars - Wheeliyo</title>
                <meta name="description" content="Manage your car listings" />
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        My Cars
                    </h1>
                    <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                        Add New Car
                    </button>
                </div>

                {/* Cars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car) => (
                        <div
                            key={car.id}
                            className="bg-white rounded-2xl p-6 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {car.name}
                                </h3>
                                <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                        car.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {car.status}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-secondary mb-4">
                                {car.price}
                            </p>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{car.views} views</span>
                                <span>{car.inquiries} inquiries</span>
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors">
                                    Edit
                                </button>
                                <button className="flex-1 bg-secondary text-white py-2 rounded-md hover:bg-secondary/90 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {cars.length === 0 && (
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
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No cars listed yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Start by adding your first car listing
                        </p>
                        <button className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                            Add Your First Car
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

Cars.layout = UserLayout
