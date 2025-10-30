'use client'
import React, { useEffect, useState } from 'react'
import UserLayout from 'components/layouts/UserLayout'
import useApi from 'lib/hooks/useApi'
import useToast from 'lib/hooks/useToast'
import API from 'lib/config/axios.config'

function PlanCard({ plan }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-pink-600">
                    {plan?.plan_id?.title || 'Plan'}
                </h2>
                <span className="text-sm text-gray-500">
                    {plan?.status === 'active' ? 'Active' : 'Expired'}
                </span>
            </div>
            <div className="mb-2">
                <span className="text-gray-700 font-medium">Amount: </span>
                <span className="text-gray-900 font-semibold">
                    ₹{plan?.plan_id?.amount}
                </span>
            </div>
            <div className="mb-2">
                <span className="text-gray-700 font-medium">Start: </span>
                <span className="text-gray-900">
                    {plan?.start_date
                        ? new Date(plan.start_date).toLocaleDateString()
                        : '-'}
                </span>
            </div>
            <div className="mb-2">
                <span className="text-gray-700 font-medium">End: </span>
                <span className="text-gray-900">
                    {plan?.end_date
                        ? new Date(plan.end_date).toLocaleDateString()
                        : '-'}
                </span>
            </div>
            <div className="mb-4">
                <span className="text-gray-700 font-medium">Features:</span>
                <ul className="list-disc ml-6 mt-1 text-gray-700">
                    {plan?.plan_id?.features?.map((f, i) => (
                        <li key={i}>{f.value}</li>
                    ))}
                </ul>
            </div>
            {/* Optionally, add cancel button if plan is active and cancellable */}
            {/* <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg">Cancel Plan</button> */}
        </div>
    )
}

export default function MyPlanPage() {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const { error } = useToast()

    const fetchPlans = async () => {
        setLoading(true)
        setErrorMsg('')
        try {
            const res = await API.get('/api/subscription/my_plans')
            setPlans(res.data?.data || [])
        } catch (err) {
            setErrorMsg('Failed to fetch plans')
            error('Failed to fetch plans')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPlans()
    }, [])

    return (
        <UserLayout>
            <div className="w-full">
                <div className="w-full bg-white rounded-2xl p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        My Plans
                    </h1>
                    <p className="text-gray-600 mb-2">
                        View your active and past subscription plans.
                    </p>
                </div>
                <div className="w-full">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                            <span className="ml-3 text-gray-600">
                                Loading plans...
                            </span>
                        </div>
                    ) : errorMsg ? (
                        <div className="text-center py-12 text-red-500">
                            {errorMsg}
                        </div>
                    ) : plans.length > 0 ? (
                        plans.map((plan) => (
                            <PlanCard key={plan._id} plan={plan} />
                        ))
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
                                        d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No active plans
                            </h3>
                            <p className="text-gray-600 mb-6">
                                You have not purchased any plans yet. Explore
                                our plans to get started!
                            </p>
                            <a
                                href="/dashboard/plans"
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all"
                            >
                                View Plans
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    )
}
