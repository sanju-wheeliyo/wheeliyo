'use client'

import React, { useState, useEffect } from 'react'
import API from 'lib/config/axios.config'
import useToast from 'lib/hooks/useToast'

export default function EditProfileModal({ open, onClose, user, onUpdate }) {
    const { success, error } = useToast()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profilePicture: null,
    })
    const [loading, setLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState('')

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                profilePicture: null,
            })
            setPreviewImage(
                user.profilePicture || '/assets/common/profile-avatar.svg'
            )
        }
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData((prev) => ({
                ...prev,
                profilePicture: file,
            }))

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewImage(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name)
            formDataToSend.append('email', formData.email)
            formDataToSend.append('phone', formData.phone)

            if (formData.profilePicture) {
                formDataToSend.append('profilePicture', formData.profilePicture)
            }

            const response = await API.put('/user/update', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (response.data.success) {
                success('Profile updated successfully!')

                // Update local storage with new user data
                const updatedUser = {
                    ...user,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    profilePicture: formData.profilePicture
                        ? `/api/user/profile-picture`
                        : user.profilePicture,
                }
                localStorage.setItem('user', JSON.stringify(updatedUser))

                onUpdate(updatedUser)
                onClose()
            }
        } catch (err) {
            error(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
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
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                            <img
                                src={previewImage}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                            <label className="absolute bottom-0 right-0 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full p-1 cursor-pointer hover:from-pink-600 hover:to-orange-600 transition-all">
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
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                </svg>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">
                            Click to change profile picture
                        </p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
