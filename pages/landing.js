import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import {
    CheckCircleIcon,
    TruckIcon,
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function Landing() {
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const goToDashboard = () => {
        router.push('/dashboard')
    }

    const goToHome = () => {
        router.push('/')
    }
// test
    const features = [
        {
            icon: TruckIcon,
            title: 'Browse Cars',
            description:
                'Explore thousands of cars from trusted dealers and private sellers in your area.',
        },
        {
            icon: UserIcon,
            title: 'Connect with Dealers',
            description:
                'Direct communication with verified car dealers and get the best deals.',
        },
        {
            icon: PhoneIcon,
            title: 'Get Notifications',
            description:
                'Stay updated with new listings and price drops for your favorite cars.',
        },
        {
            icon: MapPinIcon,
            title: 'Local Search',
            description:
                'Find cars available in your city with detailed location information.',
        },
    ]

    const quickActions = [
        {
            title: 'Search Cars',
            description: 'Find your perfect car',
            action: 'Browse Now',
            href: '/dashboard',
        },
        {
            title: 'My Profile',
            description: 'Update your preferences',
            action: 'View Profile',
            href: '/dashboard/profile',
        },
        {
            title: 'Saved Cars',
            description: 'Your favorite listings',
            action: 'View Saved',
            href: '/dashboard',
        },
    ]

    return (
        <>
            <Head>
                <title>Welcome to Wheeliyo - Your Car Marketplace</title>
                <meta
                    name="description"
                    content="Welcome to Wheeliyo! Find your perfect car from trusted dealers and sellers."
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center">
                                <img
                                    className="h-8 w-auto"
                                    src="/assets/logo.svg"
                                    alt="Wheeliyo"
                                />
                                <span className="ml-2 text-xl font-bold text-gray-900">
                                    Wheeliyo
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={goToDashboard}
                                    className="text-secondary hover:text-secondary/80 font-medium"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={goToHome}
                                    className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                                >
                                    Go to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        </div>

                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Welcome to Wheeliyo! 🎉
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Your account is now active. Start exploring
                            thousands of cars from trusted dealers and find your
                            perfect vehicle.
                        </p>

                        {user && (
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 max-w-md mx-auto">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Welcome back, {user.name}!
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>
                                        <span className="font-medium">
                                            Phone:
                                        </span>{' '}
                                        {user.phone}
                                    </p>
                                    {user.city && (
                                        <p>
                                            <span className="font-medium">
                                                Location:
                                            </span>{' '}
                                            {user.city}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={goToDashboard}
                                className="bg-gradient-to-r from-secondary to-[#F55C33] text-white px-8 py-3 rounded-md font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                            >
                                Start Browsing Cars
                                <ArrowRightIcon className="ml-2 h-5 w-5" />
                            </button>
                            <button
                                onClick={goToHome}
                                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                            What you can do with Wheeliyo
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon
                                return (
                                    <div key={index} className="text-center">
                                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-secondary/10 mb-4">
                                            <Icon className="h-6 w-6 text-secondary" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                            Quick Actions
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {quickActions.map((action, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {action.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {action.description}
                                    </p>
                                    <Link
                                        href={action.href}
                                        className="inline-flex items-center text-secondary hover:text-secondary/80 font-medium"
                                    >
                                        {action.action}
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-secondary to-[#F55C33] text-white">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-12">
                            Join thousands of satisfied users
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    10,000+
                                </div>
                                <div className="text-lg opacity-90">
                                    Cars Available
                                </div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    500+
                                </div>
                                <div className="text-lg opacity-90">
                                    Trusted Dealers
                                </div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    50+
                                </div>
                                <div className="text-lg opacity-90">
                                    Cities Covered
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <img
                            className="h-8 w-auto mx-auto mb-4"
                            src="/assets/logo.svg"
                            alt="Wheeliyo"
                        />
                        <p className="text-gray-400">
                            © 2024 Wheeliyo. All rights reserved. Your trusted
                            car marketplace.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    )
}
