import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'

function LandingMobileNavbar({ setShow }) {
    const [showDropDown, setShowDropDown] = useState(false)
    const modalRef = useRef(null)
    const router = useRouter()
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [])
    const handleModalClose = () => {
        modalRef.current.classList.add('mobile_navbar_close')
        setTimeout(() => {
            setShow(false)
        }, 200)
    }
    const handleRoute = (path) => {
        router.push(path)
        handleModalClose()
    }

    return (
        <div
            className={`fixed w-full h-full mobile-nav-gradient z-50 min-h-fit top-0 ${showDropDown ? 'overflow-y-auto' : ''
                }`}
            ref={modalRef}
        >
            {/* content section */}
            <div className="px-6  h-full">
                <div>
                    <nav className="mt-[135px]">
                        <ul>
                            <li className="text-white text-2xl font-bold">
                                <h1
                                    className="flex items-center justify-between"
                                    onClick={() =>
                                        setShowDropDown((prev) => !prev)
                                    }
                                >
                                    Sell used vehicles
                                    <span>
                                        <img
                                            src={
                                                '/assets/drop_down_white_arrow.png'
                                            }
                                            className={`${showDropDown
                                                    ? 'arrow-rotated'
                                                    : 'arrow-normal'
                                                } arrow`}
                                            alt="arrow"
                                            width={15}
                                            height={15}
                                        />
                                    </span>
                                </h1>
                                {showDropDown && (
                                    <ul className="pl-6 border-l border-l-white/[0.40] dropdown_menu-6">
                                        <li
                                            className="text-[20px] mt-4 font-normal "
                                            onClick={() =>
                                                handleRoute('/#sell-used-cars')
                                            }
                                        >
                                            Used cars
                                        </li>
                                        <li className="text-[20px] mt-4 font-normal flex gap-2 items-center">
                                            Used bikes
                                            <span>
                                                <img
                                                    src={
                                                        '/assets/coming_soon_icon.png'
                                                    }
                                                    alt="coming soon"
                                                    width={30}
                                                    height={13}
                                                />
                                            </span>
                                        </li>
                                        <li className="text-[20px] mt-4 font-normal flex gap-2 items-center">
                                            Commercial vehicles
                                            <span>
                                                <img
                                                    src={
                                                        '/assets/coming_soon_icon.png'
                                                    }
                                                    alt="coming soon"
                                                    width={30}
                                                    height={13}
                                                />
                                            </span>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li
                                className="text-white text-2xl font-bold mt-5"
                                onClick={() => handleRoute('/#how-it-works')}
                            >
                                How it works
                            </li>
                            <li
                                className="text-white text-2xl font-bold mt-5"
                                onClick={() => handleRoute('/#benefits')}
                            >
                                Why choose us
                            </li>
                            <li
                                className="text-white text-2xl font-bold mt-5"
                                onClick={() => handleRoute('/#get-in-touch')}
                            >
                                Get in touch
                            </li>
                        </ul>
                    </nav>
                    <div className="mt-[calc(10vh+8px)] text-white text-center">
                        <p className="text-[20px] font-bold">
                            Call us between 8 AM - 10 PM
                        </p>
                        <h1 className="text-2xl mt-3 font-bold">
                            +91 93537 74104
                        </h1>
                    </div>
                    <div
                        className="relative flex justify-center mt-10 cursor-pointer "
                        onClick={handleModalClose}
                    >
                        <img
                            src={'/assets/mobile_nav_close.png'}
                            alt="close"
                            width={64}
                            height={64}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingMobileNavbar
