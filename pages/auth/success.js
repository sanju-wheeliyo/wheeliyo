import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Success() {
    const [user, setUser] = useState(null)
    const [countdown, setCountdown] = useState(5)
    const router = useRouter()

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        // Auto redirect countdown
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    router.push('/dashboard')
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router])

    const goToDashboard = () => {
        router.push('/dashboard')
    }

    const goToHome = () => {
        router.push('/')
    }

    return (
        <>
            <Head>
                <title>Registration Successful - Wheeliyo</title>
                <meta
                    name="description"
                    content="Welcome to Wheeliyo! Your account has been created successfully."
                />
            </Head>

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link href="/">
                        <img
                            className="mx-auto h-12 w-auto"
                            src="/assets/logo.svg"
                            alt="Wheeliyo"
                        />
                    </Link>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Welcome to Wheeliyo! 🎉
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Your account has been created successfully. You're
                            now ready to explore our platform and find your
                            perfect car.
                        </p>

                        {user && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">
                                    Account Details
                                </h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>
                                        <span className="font-medium">
                                            Name:
                                        </span>{' '}
                                        {user.name}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Phone:
                                        </span>{' '}
                                        {user.phone}
                                    </p>
                                    {user.city && (
                                        <p>
                                            <span className="font-medium">
                                                City:
                                            </span>{' '}
                                            {user.city}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={goToDashboard}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white linear-gradient-button"
                            >
                                Go to Dashboard
                            </button>

                            <button
                                onClick={goToHome}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Back to Home
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Redirecting to dashboard in {countdown}{' '}
                                seconds...
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                What's next?
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p>• Browse available cars in your area</p>
                                <p>• Set up your profile preferences</p>
                                <p>• Get notifications for new listings</p>
                                <p>• Connect with car dealers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
