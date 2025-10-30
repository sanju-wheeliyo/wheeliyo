import { ChevronDownIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

const HeaderLinks = ({ href, name, router, isDropDown }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const navRef = useRef(null)
    const route = useRouter()
    const toggleDropdown = () => {
        if (href === '/#sell-used-cars')
            return setIsDropdownOpen(!isDropdownOpen)
    }
    const handleRoute = (path) => {
        route.push(path, null, { scroll: false })
        setIsDropdownOpen(false)
    }

    const isActive =
        router.asPath === href ||
        (router.asPath === '/' && href === '/#sell-used-cars')

    const handleClickOutside = (e) => {
        if (navRef.current && !navRef.current.contains(e.target))
            setIsDropdownOpen(false)
    }
    useEffect(() => {
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])
    return (
        <ul
            className="hidden lg:flex text-primary items-center justify-center relative select-none"
            ref={navRef}
        >
            {!isDropDown ? (
                <Link
                    className={` ${
                        isActive &&
                        'border-b-2  border-secondary text-secondary font-semibold'
                    }`}
                    href={href}
                    scroll={false}
                >
                    <div className="flex justify-center items-center gap-2">
                        {name}
                        {isDropDown && (
                            <span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 arrow ${
                                        isDropdownOpen
                                            ? 'arrow-rotated'
                                            : 'arrow-normal'
                                    }`}
                                />
                            </span>
                        )}
                    </div>
                </Link>
            ) : (
                <div
                    onClick={toggleDropdown}
                    className={` ${
                        isActive &&
                        'border-b-2  border-secondary text-secondary font-semibold'
                    }`}
                >
                    <div className="flex justify-center items-center gap-2 cursor-pointer">
                        {name}
                        {isDropDown && (
                            <span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 arrow ${
                                        isDropdownOpen
                                            ? 'arrow-rotated'
                                            : 'arrow-normal'
                                    }`}
                                />
                            </span>
                        )}
                    </div>
                </div>
            )}
            {isDropdownOpen && (
                <div className="dropdown_pc dropdown_menu_1 z-50">
                    <h1 onClick={() => handleRoute('/#sell-used-cars')}>
                        Used Cars
                    </h1>
                    <h1 className="flex  gap-2 items-center">
                        Used Bikes
                        <span>
                            <img
                                src={'/assets/coming_soon_pink.png'}
                                width={21}
                                height={10}
                                alt="coming soon"
                            />
                        </span>
                    </h1>
                    <h1 className="flex  gap-2 items-center">
                        Commercial Vehicles
                        <span>
                            <img
                                src={'/assets/coming_soon_pink.png'}
                                width={21}
                                height={10}
                                alt="coming soon"
                            />
                        </span>
                    </h1>
                </div>
            )}
        </ul>
    )
}

export default HeaderLinks
