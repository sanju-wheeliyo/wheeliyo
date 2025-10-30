'use client'
import React, { useState } from 'react'
import UserLayout from 'components/layouts/UserLayout'
import API from 'lib/config/axios.config'
import useToast from 'lib/hooks/useToast'

function DeleteAccountModal({ open, onClose, onConfirm }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
                <h2 className="text-xl font-bold text-red-600 mb-4">
                    Delete Account
                </h2>
                <p className="text-gray-700 mb-4">
                    This irreversible action will result in the complete
                    deletion of all your data, including your profile
                    information, lead history, and any associated documents.
                    Additionally, any active plans or subscriptions will be
                    canceled. Before proceeding, please ensure that you have
                    backed up any important data you wish to retain. Once
                    confirmed, your account will be permanently deleted, and you
                    will no longer have access to the Wheeliyo dealer app or its
                    features.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold hover:from-pink-600 hover:to-orange-600"
                        onClick={onConfirm}
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function SettingsPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { success, error } = useToast()

    const handleDeleteAccount = async () => {
        setLoading(true)
        try {
            await API.post('/api/user/delete_account')
            success('Account deleted successfully!')
            // Optionally, redirect to login or landing page
            window.location.href = '/auth/login'
        } catch (err) {
            error('Failed to delete account')
        } finally {
            setLoading(false)
            setModalOpen(false)
        }
    }

    return (
        <UserLayout>
            <div className="w-full">
                <div className="w-full bg-white rounded-2xl p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Settings
                    </h1>
                    <p className="text-gray-600 mb-2">
                        Manage your account and preferences.
                    </p>
                </div>
                <div className="w-full bg-white rounded-2xl p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Account Management
                        </h2>
                        <button
                            className="text-pink-600 underline hover:text-pink-700 text-base font-medium"
                            onClick={() => setModalOpen(true)}
                        >
                            Delete Account
                        </button>
                    </div>
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-pink-700 text-sm">
                        <strong>Warning:</strong> Deleting your account is
                        permanent and cannot be undone.
                    </div>
                </div>
                <DeleteAccountModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={handleDeleteAccount}
                />
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
                        <div className="bg-white rounded-xl p-6 flex items-center gap-3 shadow-lg">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                            <span className="text-gray-700">
                                Deleting account...
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </UserLayout>
    )
}
