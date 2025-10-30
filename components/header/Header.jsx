import HeaderLinks from 'components/header/HeaderLinks'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PhoneIcon, Bars3Icon, UserIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import LandingMobileNavbar from 'components/navbar/LandingMobileNavbar'

const navigationLinks = [
    {
        name: 'Sell used vehicles',
        href: '/#sell-used-cars',
        isDropDown: true,
    },
    { name: 'How it works', href: '/#how-it-works' },
    { name: 'Why choose us', href: '/#benefits' },
    { name: 'About us', href: '/aboutUs' },
    { name: 'Get in touch', href: '/contactUs' },
]

const Header = () => {
    const router = useRouter()
    const [isNavModalOpen, setIsNavModalOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [showUserMenu, setShowUserMenu] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleNavModal = () => {
        setIsNavModalOpen(!isNavModalOpen)
    }

    const handleLogout = () => {
        localStorage.clear()
        setUser(null)
        router.push('/')
    }

    return (
        <header className="w-full h-20 xl:h-24 bg-primary sticky top-0 z-30 lg:border-none border-b-4 border-gray border">
            {isNavModalOpen && (
                <LandingMobileNavbar
                    setShow={setIsNavModalOpen}
                    show={isNavModalOpen}
                />
            )}
            <div className="xl:mx-[86px] 3xl:mx-[180px] mx-3 pt-5 flex items-center justify-between">
                <Link href={'/'}>
                    <img
                        src={'/assets/logo.svg'}
                        className="relative w-[107px] h-[42px]   xl:w-[160px] xl:h-[42px]"
                        // width={107}
                        // height={28}
                        alt="logo"
                    />
                </Link>
                <div className="flex gap-8">
                    {navigationLinks.map((navigationLink, i) => {
                        return (
                            <HeaderLinks
                                key={i}
                                name={navigationLink.name}
                                href={navigationLink.href}
                                router={router}
                                isDropDown={navigationLink.isDropDown}
                            />
                        )
                    })}
                </div>
                <div className="flex gap-5 text-secondary items-center lg:hidden">
                    <a href="tel:+91 93537 74104">
                        <PhoneIcon className="w-6 h-6 cursor-pointer" />
                    </a>
                    <Bars3Icon
                        className="w-7 h-7 cursor-pointer"
                        onClick={() => handleNavModal()}
                    />
                </div>

                {/* Auth Buttons / User Menu */}
                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
                            >
                                <UserIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                    {user.name || 'User'}
                                </span>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <Link
                                        href="/dashboard"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* <Link
                                href="/auth/login"
                                className="text-white hover:text-gray-200 transition-colors text-sm font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="bg-white text-secondary px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
                            >
                                Sign Up
                            </Link> */}
                        </div>
                    )}

                    <Link className="py-2 px-5 flex text-primary" href={'/'}>
                        <div className="py-2 px-5 flex items-center">
                            <div>
                                <div className="text-sm">
                                    Call us between 8 AM - 10 PM
                                </div>
                                <div className="text-right font-semibold">
                                    +91 93537 74104
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Header
