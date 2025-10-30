'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DebugToken() {
    const [localStorageData, setLocalStorageData] = useState({})
    const [apiTest, setApiTest] = useState(null)

    useEffect(() => {
        // Get localStorage data
        const data = {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
            user: localStorage.getItem('user'),
            tempLoginPhone: localStorage.getItem('tempLoginPhone')
        }
        setLocalStorageData(data)
    }, [])

    const testApi = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) {
                setApiTest({ error: 'No access token found' })
                return
            }

            const response = await fetch('/api/subscription/my_plans', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            setApiTest({ status: response.status, data })
        } catch (error) {
            setApiTest({ error: error.message })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Authentication Debug</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">📱 LocalStorage Data</h2>
                    <div className="space-y-2">
                        <div>
                            <strong>Access Token:</strong>
                            <span className={`ml-2 ${localStorageData.accessToken ? 'text-green-600' : 'text-red-600'}`}>
                                {localStorageData.accessToken ? '✅ Found' : '❌ Missing'}
                            </span>
                            {localStorageData.accessToken && (
                                <div className="text-xs text-gray-500 mt-1 break-all">
                                    {localStorageData.accessToken.substring(0, 50)}...
                                </div>
                            )}
                        </div>
                        <div>
                            <strong>Refresh Token:</strong>
                            <span className={`ml-2 ${localStorageData.refreshToken ? 'text-green-600' : 'text-red-600'}`}>
                                {localStorageData.refreshToken ? '✅ Found' : '❌ Missing'}
                            </span>
                        </div>
                        <div>
                            <strong>User Data:</strong>
                            <span className={`ml-2 ${localStorageData.user ? 'text-green-600' : 'text-red-600'}`}>
                                {localStorageData.user ? '✅ Found' : '❌ Missing'}
                            </span>
                            {localStorageData.user && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {localStorageData.user}
                                </div>
                            )}
                        </div>
                        <div>
                            <strong>Temp Login Phone:</strong>
                            <span className={`ml-2 ${localStorageData.tempLoginPhone ? 'text-blue-600' : 'text-gray-600'}`}>
                                {localStorageData.tempLoginPhone || 'None'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">🧪 API Test</h2>
                    <button
                        onClick={testApi}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Test My Plans API
                    </button>
                    {apiTest && (
                        <div className="mt-4 p-4 bg-gray-100 rounded">
                            <pre className="text-sm">{JSON.stringify(apiTest, null, 2)}</pre>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">🚀 Next Steps</h2>
                    <div className="space-y-2">
                        {!localStorageData.accessToken ? (
                            <div className="text-red-600">
                                ❌ <strong>You are NOT logged in!</strong> Go to{' '}
                                <Link href="/auth/login" className="underline">/auth/login</Link> to login.
                            </div>
                        ) : (
                            <div className="text-green-600">
                                ✅ <strong>You are logged in!</strong> The issue might be with the API calls.
                            </div>
                        )}
                        <div>
                            📱 <strong>Your Phone:</strong> +919995040559
                        </div>
                        <div>
                            🔑 <strong>User ID:</strong> 68a77a443fe77824ec2d234a
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
