'use client'
import useApp from 'lib/hooks/useApp'
import { useRouter } from 'next/router'
import React, { act, useEffect, useState } from 'react'
import AdminProfile from './AdminProfile'
import { useConfirm } from 'lib/hooks/useConfirm'

export default function SideDrawer() {
    const auth = useApp()
    const router = useRouter()
    const { isConfirmed } = useConfirm()
    const [active, setAcitve] = useState(router.pathname)
    const [innerNavOpen, setInnerNavOpen] = useState(null)

    const handleRoute = (link) => {
        handleActiveState(link)
        router.push(link)
    }

    const handleActiveState = (state) => {
        setAcitve(state)
    }

    const handleInnerNav = (openNav) => {
        setInnerNavOpen(openNav)
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

    const LeadsArray = [
        {
            label: 'Recently added',
            links: '/admin/leads/recently-added',
        },
        {
            label: 'Approved leads',
            links: '/admin/leads/approved-leads',
        },
        {
            label: 'Not approved leads',
            links: '/admin/leads/not-approved-leads',
        },
    ]
    const DealersArray = [
        {
            label: 'Premium dealers',
            links: '/admin/dealers/premium',
        },
        {
            label: 'All Dealers',
            links: '/admin/dealers/all',
        },
    ]

    const ManageDataArray = [
        {
            label: 'Available cities',
            links: '/admin/data/cities',
        },
    ]

    const KYCArray = [
        {
            label: 'KYC Approvals',
            links: '/admin/kyc',
        },
    ]

    const isLeads = LeadsArray.some((e) => e.links === active)
    const isDealers = DealersArray.some((e) => e.links === active)
    const isManageData = ManageDataArray.some((e) => e.links === active)
    const isKYC = KYCArray.some((e) => e.links === active)

    useEffect(() => {
        setAcitve(router.pathname)
        if (isLeads) {
            handleInnerNav('leads')
        }
        if (isDealers) {
            handleInnerNav('dealers')
        }
        if (isKYC) {
            handleInnerNav('kyc')
        }
    }, [router.pathname])

    useEffect(() => {
        if (isLeads) {
            handleInnerNav('leads')
        }
        if (isDealers) {
            handleInnerNav('dealers')
        }
        if (isKYC) {
            handleInnerNav('kyc')
        }
    }, [active])

    return (
        <div className="rounded-2xl p-[15px] bg-white bg-opacity-90">
            <div className="w-full">
                <div className="w-full max-w-[206px] cursor-pointer hidden lg:block pb-8">
                    <img className="w-full" src="/assets/logo.svg" alt="Logo" />
                </div>
            </div>
            <div className="w-full py-6 flex lg:hidden">
                <AdminProfile />
            </div>
            {/* Navigation */}
            <div className="w-full">
                <ul>
                    <li className="pt-4 cursor-pointer">
                        <span
                            onClick={() => handleInnerNav('leads')}
                            className="flex justify-between items-center pb-2"
                        >
                            <div className="flex items-center">
                                <span className="block w-8">
                                    <img
                                        src={
                                            innerNavOpen === 'leads'
                                                ? '/assets/common/sidenav/leads-color.svg'
                                                : '/assets/common/sidenav/lead-grey.svg'
                                        }
                                        alt="Leads"
                                    />
                                </span>
                                <span
                                    className={`font-bold text-sm cursor-pointer ${
                                        innerNavOpen === 'leads'
                                            ? 'text-[#D01768]'
                                            : 'text-[#334155]'
                                    }`}
                                >
                                    Leads
                                </span>
                            </div>
                            <img
                                src={
                                    innerNavOpen === 'leads'
                                        ? '/assets/common/sidenav/arrow-top.svg'
                                        : '/assets/common/sidenav/arrow-right.svg'
                                }
                                alt="Toggle"
                            />
                        </span>
                        {innerNavOpen === 'leads' && (
                            <ul className="sub-list">
                                {LeadsArray.map((leads, index) => (
                                    <li
                                        onClick={() => handleRoute(leads.links)}
                                        key={index}
                                        className={`py-2 text-xs cursor-pointer ${
                                            router.pathname === leads.links
                                                ? 'text-[#D01768] sub-list-active'
                                                : 'text-[#334155]'
                                        }`}
                                    >
                                        {leads.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                    <li className="pt-4 cursor-pointer">
                        <span
                            onClick={() => handleInnerNav('dealers')}
                            className="flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <span className="block w-8">
                                    <img
                                        src={
                                            innerNavOpen === 'dealers'
                                                ? '/assets/common/sidenav/dealer-color.svg'
                                                : '/assets/common/sidenav/dealer-grey.svg'
                                        }
                                        alt="Dealers"
                                    />
                                </span>
                                <span
                                    className={`font-bold text-sm cursor-pointer ${
                                        innerNavOpen === 'dealers'
                                            ? 'text-[#D01768]'
                                            : 'text-[#334155]'
                                    }`}
                                >
                                    Dealers
                                </span>
                            </div>
                            <img
                                src={
                                    innerNavOpen === 'dealers'
                                        ? '/assets/common/sidenav/arrow-top.svg'
                                        : '/assets/common/sidenav/arrow-right.svg'
                                }
                                alt="Toggle"
                            />
                        </span>
                        {innerNavOpen === 'dealers' && (
                            <ul className="sub-list">
                                {DealersArray.map((dealer, index) => (
                                    <li
                                        onClick={() =>
                                            handleRoute(dealer.links)
                                        }
                                        key={index}
                                        className={`py-2 text-xs cursor-pointer ${
                                            router.pathname === dealer.links
                                                ? 'text-[#D01768] sub-list-active'
                                                : 'text-[#334155]'
                                        }`}
                                    >
                                        {dealer.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                    <li className="pt-4 cursor-pointer">
                        <span
                            onClick={() => handleInnerNav('kyc')}
                            className="flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <span className="block w-8">
                                    <img
                                        src={
                                            innerNavOpen === 'kyc'
                                                ? '/assets/common/sidenav/documents-color.svg'
                                                : '/assets/common/sidenav/documents-grey.svg'
                                        }
                                        alt="User's KYC"
                                    />
                                </span>
                                <span
                                    className={`font-bold text-sm cursor-pointer ${
                                        innerNavOpen === 'kyc'
                                            ? 'text-[#D01768]'
                                            : 'text-[#334155]'
                                    }`}
                                >
                                    User's KYC
                                </span>
                            </div>
                            <img
                                src={
                                    innerNavOpen === 'kyc'
                                        ? '/assets/common/sidenav/arrow-top.svg'
                                        : '/assets/common/sidenav/arrow-right.svg'
                                }
                                alt="Toggle"
                            />
                        </span>
                        {innerNavOpen === 'kyc' && (
                            <ul className="sub-list">
                                {KYCArray.map((kyc, index) => (
                                    <li
                                        onClick={() => handleRoute(kyc.links)}
                                        key={index}
                                        className={`py-2 text-xs cursor-pointer ${
                                            router.pathname === kyc.links
                                                ? 'text-[#D01768] sub-list-active'
                                                : 'text-[#334155]'
                                        }`}
                                    >
                                        {kyc.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                    <li className="pt-4 cursor-pointer">
                        <div
                            className="flex gap-3 items-center"
                            onClick={() => {
                                handleRoute('/admin/invoices')
                                handleInnerNav(null)
                            }}
                        >
                            <img
                                src={
                                    active === '/admin/invoices' &&
                                    !innerNavOpen
                                        ? '/assets/common/sidenav/invoice-color.svg'
                                        : '/assets/common/sidenav/invoice-grey.svg'
                                }
                                alt="Invoices"
                            />

                            <p
                                className={`text-sm font-bold cursor-pointer ${
                                    active === '/admin/invoices' &&
                                    !innerNavOpen
                                        ? 'text-[#D01768]'
                                        : 'text-[#334155]'
                                }`}
                            >
                                Invoices
                            </p>
                        </div>
                    </li>

                    <li className="pt-4 cursor-pointer">
                        <span
                            onClick={() => handleInnerNav('data')}
                            className="flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <span className="block w-8">
                                    <img
                                        src={
                                            innerNavOpen === 'data'
                                                ? '/assets/common/sidenav/manage-data-gradient.svg'
                                                : '/assets/common/sidenav/manage-data-gray.svg'
                                        }
                                        alt="Dealers"
                                    />
                                </span>
                                <span
                                    className={`font-bold text-sm cursor-pointer ${
                                        innerNavOpen === 'data'
                                            ? 'text-[#D01768]'
                                            : 'text-[#334155]'
                                    }`}
                                >
                                    Manage data
                                </span>
                            </div>
                            <img
                                src={
                                    innerNavOpen === 'data'
                                        ? '/assets/common/sidenav/arrow-top.svg'
                                        : '/assets/common/sidenav/arrow-right.svg'
                                }
                                alt="Toggle"
                            />
                        </span>
                        {innerNavOpen === 'data' && (
                            <ul className="sub-list">
                                {ManageDataArray.map((item, index) => (
                                    <li
                                        onClick={() => handleRoute(item.links)}
                                        key={index}
                                        className={`py-2 text-xs cursor-pointer ${
                                            router.pathname === item.links
                                                ? 'text-[#D01768] sub-list-active'
                                                : 'text-[#334155]'
                                        }`}
                                    >
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    <li className="pt-4 cursor-pointer">
                        <div
                            className="flex gap-3 items-center"
                            onClick={() => {
                                handleRoute('/admin/queries')
                                handleInnerNav(null)
                            }}
                        >
                            <img
                                src={
                                    active === '/admin/queries' && !innerNavOpen
                                        ? '/assets/common/sidenav/enquries-gradient.svg'
                                        : '/assets/common/sidenav/enquiries-gray.svg'
                                }
                                alt="Enquiries"
                            />

                            <p
                                className={`text-sm font-bold cursor-pointer ${
                                    active === '/admin/queries' && !innerNavOpen
                                        ? 'text-[#D01768]'
                                        : 'text-[#334155]'
                                }`}
                            >
                                Enquiries
                            </p>
                        </div>
                    </li>
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
