'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import EditProfileModal from './EditProfileModal'

export default function UserProfile() {
    const [user, setUser] = useState({})
    const [showEditModal, setShowEditModal] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            setUser(userData)
        }
    }, [])

    const handleProfileClick = () => {
        setShowEditModal(true)
    }

    const handleProfileUpdate = (updatedUser) => {
        setUser(updatedUser)
        // Trigger a page refresh to update the header
        window.location.reload()
    }

    return (
        <>
            <div
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleProfileClick}
            >
                <img
                    className="w-[30px] lg:w-[43px] h-[30px] lg:h-[43px] rounded-full overflow-hidden"
                    src={
                        user?.profilePicture
                            ? `/api/user/profile-picture`
                            : '/assets/common/profile-avatar.svg'
                    }
                    alt="Profile"
                />
                <span className="hidden pl-2 md:flex flex-col leading-[12px]">
                    <span className="text-xs text-[#64748B] leading-[12px] pb-1">
                        User
                    </span>
                    <span className="text-[14px] lg:text-lg text-[#000000] font-[600] leading-[12px]">
                        {user?.name || 'User'}
                    </span>
                </span>
            </div>

            <EditProfileModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                onUpdate={handleProfileUpdate}
            />
        </>
    )
}
