import Link from 'next/link'

const Footer = () => {
    return (
        <div className=" bg-primary h-full mt-24 pt-6 pb-4">
            <div className="lg:flex-row flex-col flex text-center px-auto pb-4 3xl:px-[180px] lg:px-5 justify-between xl:px-[96px]  items-center h-2/3 border-b-[rgba(98, 98, 99, 0.19)] border-b-2">
                <div className="flex flex-col gap-3">
                    <Link href={'/'}>
                        <img
                            className="w-[174px] h-[46px] -ml-[15px] xl:mr-[100px] pt-3  xl:w-[160px] xl:h-[42px]"
                            src={'/assets/logo.svg'}
                            // width={107}
                            // height={28}
                            alt="logo"
                        />
                    </Link>
                    <div>
                        <ul className="list-none m-0 p-0 flex">
                            <li className="p-1.5">
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-7 h-7"
                                    href="https://www.instagram.com/wheeliyo/"
                                >
                                    <img
                                        className="w-full"
                                        src="https://staging-wheeliyo.s3.us-east-2.amazonaws.com/insta.png"
                                        alt="Instagram"
                                    />
                                </a>
                            </li>
                            <li className="p-1.5">
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-7 h-7"
                                    href="https://x.com/wheeliyo?t=Z4jj3ScvDh-4GCg3vsm4Ow&s=09"
                                >
                                    <img
                                        className="w-full"
                                        src="https://staging-wheeliyo.s3.us-east-2.amazonaws.com/x.png"
                                        alt="X"
                                    />
                                </a>
                            </li>
                            <li className="p-1.5">
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-7 h-7"
                                    href="https://www.facebook.com/profile.php?id=100088849007458&mibextid=LQQJ4d"
                                >
                                    <img
                                        className="w-full"
                                        src="https://staging-wheeliyo.s3.us-east-2.amazonaws.com/facebook.png"
                                        alt="Facebook"
                                    />
                                </a>
                            </li>
                            <li className="p-1.5">
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-7 h-7"
                                    href="https://www.linkedin.com/company/wheeliyo/"
                                >
                                    <img
                                        className="w-full"
                                        src="https://staging-wheeliyo.s3.us-east-2.amazonaws.com/linkedin.png"
                                        alt="LinkedIn"
                                    />
                                </a>
                            </li>
                        </ul>
                    </div>{' '}
                </div>
                <div className="flex flex-col items-center ">
                    <ul className="lg:flex-row flex-col flex text-gray-light items-center justify-center lg:mr-16">
                        <li>
                            <Link
                                scroll={false}
                                href="/#sell-used-cars"
                                className="py-2 xl:px-5 px-2 flex"
                            >
                                Sell used vehicles
                            </Link>
                        </li>
                        <li>
                            <Link
                                scroll={false}
                                href="/#how-it-works"
                                className="py-2 xl:px-5 px-2 flex"
                            >
                                How it works
                            </Link>
                        </li>
                        <li>
                            <Link
                                scroll={false}
                                href="/#benefits"
                                className="py-2 xl:px-5 px-2 flex"
                            >
                                Why choose us
                            </Link>
                        </li>
                        <li>
                            <Link
                                scroll={false}
                                href="/aboutUs"
                                className="py-2 xl:px-5 px-2 flex"
                            >
                                About us
                            </Link>
                        </li>
                        <li>
                            <Link
                                scroll={false}
                                href="/contactUs"
                                className="py-2 xl:px-5 px-2 flex"
                            >
                                Get in touch
                            </Link>
                        </li>
                    </ul>

                    <ul className="sm:w-[326px] flex ">
                        <li className="py-2">
                            <a
                                href="https://play.google.com/store/apps/details?id=com.wheeliyo"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 px-4 rounded-xl border border-solid border-white bg-black flex justify-center items-center cursor-pointer no-underline text-white"
                            >
                                <span className="flex flex-col pl-2">
                                    <span className="text-[10px] leading-[14px]">
                                        Get it on{' '}
                                    </span>
                                    <span className="text-sm font-bold leading-[14px]">
                                        Google Play
                                    </span>
                                </span>
                            </a>
                        </li>
                        <li className="p-2">
                            <a
                                href="#"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 px-4 rounded-xl border border-solid border-white bg-black flex justify-center items-center cursor-pointer no-underline text-white"
                            >
                                <span className="w-[22px] h-[27px] block">
                                    <img
                                        className="w-full"
                                        src="/assets/appstore.png"
                                    />
                                </span>
                                <span className="flex flex-col pl-2">
                                    <span className="text-[10px] leading-[14px]">
                                        Download on the{' '}
                                    </span>
                                    <span className="text-sm font-bold leading-[14px]">
                                        App Store
                                    </span>
                                </span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <Link
                        scroll={false}
                        href="#"
                        className="py-2 flex items-center text-gray-light"
                    >
                        <div>
                            <div className="text-sm">
                                Call us between 8 AM - 10 PM
                            </div>
                            <div className="lg:text-right font-semibold">
                                +91 93537 74104
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="bg-primary lg:flex-row flex flex-col-reverse justify-between xl:px-[96px] px-auto md:px-5 3xl:px-[180px]  items-center text-gray-light h-1/3">
                <div className="text-center px-0">
                    www.wheeliyo.com All rights reserved ® 2022
                </div>
                <div className="text-center lg:flex">
                    <Link href={'/privacyPolicy'}>
                        <h1 className="py-2 lg:py-0 text-[20px]">
                            Privacy policy
                        </h1>
                    </Link>
                    <Link href={'/termsAndConditions'}>
                        <h1 className="lg:pl-6 lg:py-0 text-[20px] pb-4">
                            Terms and conditions
                        </h1>
                    </Link>
                    <Link href={'/cancelationRefund'}>
                        <h1 className="lg:pl-6 lg:py-0 text-[20px] pb-4">
                            Refund policy
                        </h1>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Footer
