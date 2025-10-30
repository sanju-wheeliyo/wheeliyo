import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import UserContext from 'lib/context/UserContext'
import UserLayout from 'components/layouts/UserLayout'

export default function Favorites() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [favorites, setFavorites] = useState([])

    useEffect(() => {
        // Set header for the layout
        setHeader('Favorites')
        setHeaderIcon('/assets/common/sidenav/favorites-color.svg')

        // Mock data - replace with actual API call
        setFavorites([
            {
                id: 1,
                name: 'Toyota Innova 2021',
                price: '₹12,50,000',
                location: 'Mumbai',
                dealer: 'ABC Motors',
                image: '/assets/leads/car-one.png',
            },
            {
                id: 2,
                name: 'Honda City 2020',
                price: '₹8,50,000',
                location: 'Delhi',
                dealer: 'XYZ Cars',
                image: '/assets/leads/car-one.png',
            },
            {
                id: 3,
                name: 'Maruti Swift 2019',
                price: '₹5,20,000',
                location: 'Bangalore',
                dealer: 'Premium Motors',
                image: '/assets/leads/car-one.png',
            },
        ])
    }, [setHeader, setHeaderIcon])

    return (
        <>
            <Head>
                <title>Favorites - Wheeliyo</title>
                <meta name="description" content="Your favorite cars" />
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Favorites
                    </h1>
                    <span className="text-sm text-gray-600">
                        {favorites.length} cars
                    </span>
                </div>

                {/* Favorites Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((car) => (
                        <div
                            key={car.id}
                            className="bg-white rounded-2xl p-6 shadow-sm"
                        >
                            <div className="aspect-w-16 aspect-h-9 mb-4">
                                <img
                                    src={car.image}
                                    alt={car.name}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {car.name}
                            </h3>
                            <p className="text-2xl font-bold text-secondary mb-2">
                                {car.price}
                            </p>
                            <div className="text-sm text-gray-600 mb-4">
                                <p>
                                    {car.location} • {car.dealer}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button className="flex-1 bg-secondary text-white py-2 rounded-md hover:bg-secondary/90 transition-colors">
                                    View Details
                                </button>
                                <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {favorites.length === 0 && (
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
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No favorites yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Start browsing cars and add them to your favorites
                        </p>
                        <button className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                            Browse Cars
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

Favorites.layout = UserLayout
