'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import UserLayout from 'components/layouts/UserLayout'
import useApi from 'lib/hooks/useApi'
import {
    getNotifications,
    readAllNotifications,
    deleteNotification,
} from 'lib/services/notification.services'
import useToast from 'lib/hooks/useToast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

// Notification Card Component
function NotificationCard({ notification, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const API_deleteNotification = useApi(deleteNotification)
    const { success, error } = useToast()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await API_deleteNotification.request(notification._id)
            if (res?.data?.success) {
                success('Notification deleted successfully')
                onDelete(notification._id)
            } else {
                error('Failed to delete notification')
            }
        } catch (err) {
            error('Failed to delete notification')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3 relative">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {notification?.meta?.title || 'Notification'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {notification?.meta?.body || 'No description available'}
                    </p>
                    <p className="text-xs text-gray-400">
                        {dayjs(notification?.createdAt).fromNow()}
                    </p>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                    {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                    ) : (
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    )}
                </button>
            </div>
            {!notification?.read && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
            )}
        </div>
    )
}

// Delete Confirmation Modal
function DeleteModal({ isOpen, onClose, onConfirm, notification }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Delete Notification
                </h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this notification? This
                    action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function NotificationsPage() {
    const router = useRouter()
    const { success, error } = useToast()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        notification: null,
    })

    const API_getNotifications = useApi(getNotifications)
    const API_readAllNotifications = useApi(readAllNotifications)

    const fetchNotifications = async () => {
        try {
            const res = await API_getNotifications.request({ limit: 50 })
            if (res?.data?.success) {
                setNotifications(res.data.data || [])
            } else {
                error('Failed to fetch notifications')
            }
        } catch (err) {
            error('Failed to fetch notifications')
        } finally {
            setLoading(false)
        }
    }

    const handleReadAll = async () => {
        try {
            const res = await API_readAllNotifications.request()
            if (res?.data?.success) {
                // Mark all notifications as read locally
                setNotifications((prev) =>
                    prev.map((notif) => ({ ...notif, read: true }))
                )
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        }
    }

    const handleDelete = (notificationId) => {
        setNotifications((prev) =>
            prev.filter((notif) => notif._id !== notificationId)
        )
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchNotifications()
        setRefreshing(false)
    }

    useEffect(() => {
        fetchNotifications()
        // Mark all notifications as read when page loads
        handleReadAll()
    }, [])

    const unreadCount = notifications.filter((notif) => !notif.read).length

    return (
        <UserLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Notifications
                            </h1>
                        </div>
                        {unreadCount > 0 && (
                            <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCount} new
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin"></div>
                        </div>
                    ) : notifications.length === 0 ? (
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
                                        d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM20 9h-6v2h6V9zM4 15h6v-2H4v2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No notifications
                            </h3>
                            <p className="text-gray-500">
                                You're all caught up! Check back later for new
                                updates.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <NotificationCard
                                    key={notification._id}
                                    notification={notification}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Modal */}
                <DeleteModal
                    isOpen={deleteModal.isOpen}
                    onClose={() =>
                        setDeleteModal({ isOpen: false, notification: null })
                    }
                    onConfirm={() => {
                        if (deleteModal.notification) {
                            handleDelete(deleteModal.notification._id)
                        }
                        setDeleteModal({ isOpen: false, notification: null })
                    }}
                    notification={deleteModal.notification}
                />
            </div>
        </UserLayout>
    )
}
