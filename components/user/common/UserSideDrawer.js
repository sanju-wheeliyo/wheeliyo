'use client'
import useApp from 'lib/hooks/useApp'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import UserProfile from './UserProfile'
import { useConfirm } from 'lib/hooks/useConfirm'

export default function UserSideDrawer() {
    const auth = useApp()
    const router = useRouter()
    const { isConfirmed } = useConfirm()
    const [active, setActive] = useState(router.pathname)

    const handleRoute = (link) => {
        handleActiveState(link)
        router.push(link)
    }

    const handleActiveState = (state) => {
        setActive(state)
    }

    const handleLogout = async () => {
        if (
            await isConfirmed({
                title: 'Logout account?',
                description: 'Are you sure you want to Logout your account?',
                confirmButtonLabel: 'Yes',
                cancelButtonLabel: 'No',
            })
        ) {
            auth.logoutUser()
        }
    }

    // Mobile app menu items in exact order - using exact icon names from mobile app
    const menuItems = [
        {
            label: 'Seller',
            route: '/dashboard/seller',
            icon: 'sellerIcon',
            activeIcon: 'sellerIcon',
        },
        {
            label: 'Leads',
            route: '/dashboard/leads',
            icon: 'leadsMenuIconGray',
            activeIcon: 'leadsMenuIconGray',
        },
        {
            label: 'Liked',
            route: '/dashboard/liked',
            icon: 'favouritesMenuIconGray',
            activeIcon: 'favouritesMenuIconGray',
        },
        {
            label: 'Invoices',
            route: '/dashboard/invoices',
            icon: 'invoiceMenuIcon',
            activeIcon: 'invoiceMenuIcon',
        },
        {
            label: 'My plan',
            route: '/dashboard/my-plan',
            icon: 'planMenuIconGray',
            activeIcon: 'planMenuIconGray',
        },
        {
            label: 'Settings',
            route: '/dashboard/settings',
            icon: 'settingsIcon',
            activeIcon: 'settingsIcon',
        },
        {
            label: 'Privacy policy',
            route: '/privacyPolicy',
            icon: 'privacyPolicyMenuIconGray',
            activeIcon: 'privacyPolicyMenuIconGray',
        },
        {
            label: 'Refund policy',
            route: '/cancelationRefund',
            icon: 'refundPolicyIconGray',
            activeIcon: 'refundPolicyIconGray',
        },
        {
            label: 'Terms & Conditions',
            route: '/termsAndConditions',
            icon: 'termsAndConditionMenuIconGray',
            activeIcon: 'termsAndConditionMenuIconGray',
        },
    ]

    useEffect(() => {
        if (router.pathname !== active) {
            setActive(router.pathname)
        }
    }, [router.pathname, active])

    return (
        <div className="rounded-2xl p-[15px] bg-white bg-opacity-90">
            <div className="w-full">
                <div className="w-full max-w-[206px] cursor-pointer hidden lg:block pb-8">
                    <img className="w-full" src="/assets/logo.svg" alt="Logo" />
                </div>
            </div>
            <div className="w-full py-6 flex lg:hidden">
                <UserProfile />
            </div>
            {/* Navigation */}
            <div className="w-full">
                <ul>
                    {menuItems.map((item, index) => {
                        const isActive = active === item.route
                        return (
                            <li key={index} className="pt-4 cursor-pointer">
                                <div
                                    className="flex gap-3 items-center"
                                    onClick={() => handleRoute(item.route)}
                                >
                                    <img
                                        src={
                                            isActive
                                                ? `/assets/common/sidenav/${item.activeIcon}.svg`
                                                : `/assets/common/sidenav/${item.icon}.svg`
                                        }
                                        alt={item.label}
                                        className="w-6 h-6"
                                    />
                                    <p
                                        className={`text-sm font-bold cursor-pointer ${
                                            isActive
                                                ? 'text-[#D01768]'
                                                : 'text-[#334155]'
                                        }`}
                                    >
                                        {item.label}
                                    </p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className="w-full">
                <span className="w-full block my-9">
                    <img
                        className="w-full"
                        src="/assets/common/sidenav-border.png"
                        alt="Sidenav border"
                    />
                </span>
                <ul>
                    <li>
                        <span
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={handleLogout}
                        >
                            <img
                                src="/assets/common/sidenav/logout-grey.svg"
                                alt="Logout"
                            />
                            <span className="text-[#475569] font-bold text-sm">
                                Logout
                            </span>
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    )
}
