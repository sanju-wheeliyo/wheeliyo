import Footer from 'components/sections/footer'
import FbHomePixel from 'lib/pixel/FbHomePixel'
import GoogleHomePixel from 'lib/pixel/GoogleHomePixel'
import GoogleSuccessTrackTag from 'lib/pixel/GoogleSuccessTrackTag'
import Link from 'next/link'
import { useRouter } from 'next/router'

const SuccessPage = () => {
    const router = useRouter()
    return (
        <>
            <Link href={'/#sell-used-cars'} scroll={false}>
                <img
                    className="w-[107px] h-[42px] xl:mx-[86px] 3xl:mx-[180px] mx-3  xl:w-[160px] xl:h-[42px] m-8"
                    src={'/assets/logo.svg'}
                    // width={107}
                    // height={28}
                />
            </Link>

            <FbHomePixel />
            <GoogleSuccessTrackTag />
            {/* <Header /> */}
            <div className="flex h-[calc(100vh-150px)] justify-center">
                <div className="flex flex-col justify-center items-center h-full text-center mx-5 lg:mx-10 gap-7 w-[620px]">
                    <img
                        alt="illustration"
                        className="w-[174px] h-[130px] lg:w-[202px] lg:h-[150px] relative"
                        src={'/assets/success_modal_illustration.png'}
                    />
                    <h1 className="lg:text-2xl text-base font-bold">
                        &quot;Our team will get back to you shortly with all the
                        required information about your car’s selling process.
                        <br />
                        <br /> Until then, keep waiting!&quot;
                    </h1>
                    <button
                        onClick={() => router.push('/')}
                        className="w-[215px] h-[50px] linear-gradient-button rounded-md text-white"
                    >
                        Home
                    </button>

                    {/* <Footer /> */}
                    <div className="flex justify-center w-full">
                        <ul className="flex gap-4">
                            <li className="py-2">
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.wheeliyo"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 px-4 rounded-xl border border-solid border-white bg-black flex justify-center items-center cursor-pointer no-underline text-white"
                                >
                                    <span className="w-[25px] h-[25px] block">
                                        <img
                                            className="w-full"
                                            src="/assets/playstore.png"
                                        />
                                    </span>
                                    <span className="flex flex-col pl-2">
                                        <span className="text-[10px] leading-[14px]">
                                            Get it on
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
                                            Download on the
                                        </span>
                                        <span className="text-sm font-bold leading-[14px]">
                                            App Store
                                        </span>
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SuccessPage
