import { useRouter } from 'next/router'

const LandingPage = () => {
    const router = useRouter()
    return (
        <>
            <div className="hidden h-[calc(100vh-5rem)] max-h-[625px] min-h-[500px] xl:h-[75vh] xl:items-center  xl:justify-around sm:flex flex-col xl:flex-row ">
                <div className="w-full flex  xl:h-[460px] pt-14 xl:pt-[10px] absolute z-10">
                    <div className="mx-3 xl:ml-[95px] 3xl:ml-[180px] text-primary ">
                        <h1 className="text-[26px] md:text-[1.8rem] !leading-[41px] font-bold md:!leading-[57px]">
                            Get the best price for your car,
                            <br /> Enter details to get a Free Quote.
                        </h1>
                        <div className="relative">
                            <img
                                className="my-4 lg:my-6"
                                alt="divider"
                                src={'/assets/divider.png'}
                                width={105}
                                height={2}
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-10 text-xl">
                            <div className="flex items-center gap-2">
                                <img
                                    className=""
                                    alt="verified"
                                    src={'/assets/verified.png'}
                                    width={29}
                                    height={29}
                                />
                                <p>Quick & Hassle-free</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <img
                                    className="my-3"
                                    alt="verified"
                                    src={'/assets/verified.png'}
                                    width={29}
                                    height={29}
                                />
                                <p>Safe doorstep evaluation</p>
                            </div>
                            <div className="flex items-center gap-2 text-xl">
                                <img
                                    className=""
                                    alt="verified"
                                    src={'/assets/verified.png'}
                                    width={29}
                                    height={29}
                                />
                                <p>The best evaluated price</p>
                            </div>
                            <button
                                onClick={() =>
                                    window.open(
                                        'https://play.google.com/store/apps/details?id=com.wheeliyo',
                                        '_blank'
                                    )
                                }
                                className="w-[215px] h-[50px] linear-gradient-button rounded-md text-white mt-10"
                            >
                                Get Car Price
                            </button>
                        </div>
                    </div>
                </div>
                <div className="ml-auto flex justify-end h-full w-full flex-1 xl:w-fit">
                    <div className="hidden xl:block max-h-[580px] w-[90%] h-full xl:w-[750px] xl:h-[659.71px] md:mt-0 ">
                        <img
                            className="hidden object-contain object-right xl:block max-h-[580px] w-[90%] h-full xl:w-[750px] xl:h-[659.71px] md:mt-0 "
                            alt="landing_car"
                            src={'/assets/landing_page_banner.png'}
                        />
                    </div>

                    <img
                        alt="landing_car"
                        className="xl:hidden object-contain object-right mt-[23px] max-h-[580px] w-[70%] h-full xl:w-[750px] xl:h-[659.71px] md:mt-0 "
                        src={'/assets/banner_image_mobile.png'}
                    />
                </div>
            </div>

            {/* <div className="md:hidden w-full h-[450px] mobile-banner"></div> */}
            <div className="sm:hidden">
                <img
                    src="/assets/mobile-banner.jpg"
                    className="w-full h-full"
                    alt="mobile-banner"
                />
                {/* <div className='w-full h-full'>
                    <Image
                        src={"/assets/mobile-banner.jpg"}
                        alt="mobile-banner"
                        fill
                    />
                </div> */}
                <div className="absolute top-32 ml-6 mx-3 xl:ml-[95px] 3xl:ml-[180px] text-white ">
                    <h1 className="text-[28px] poppins md:text-[48px] !leading-[41px] md:!leading-[57px]">
                        Get the{' '}
                        <span className="font-bold poppins">
                            best price for your car
                        </span>
                    </h1>
                    <div className="flex flex-col mt-[26px] text-sm ">
                        <div className="flex items-center gap-2">
                            <img
                                className=""
                                alt="points"
                                src={'/assets/checkbox_points.svg'}
                                width={22}
                                height={22}
                            />
                            <p className="poppins">
                                Quick &{' '}
                                <span className="poppins font-bold">
                                    Hassle-free
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <img
                                className="my-3"
                                alt="points"
                                src={'/assets/checkbox_points.svg'}
                                width={22}
                                height={22}
                            />
                            <p className="poppins">
                                Safe{' '}
                                <span className="poppins font-bold">
                                    doorstep evaluation
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <img
                                className=""
                                alt="points"
                                src={'/assets/checkbox_points.svg'}
                                width={22}
                                height={22}
                            />
                            <p className="poppins">
                                The best{' '}
                                <span className="poppins font-bold">
                                    evaluated price
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                window.open(
                                    'https://play.google.com/store/apps/details?id=com.wheeliyo',
                                    '_blank'
                                )
                            }
                            className="w-[215px] h-[50px] bg-white  rounded-md text-secondary text-lg uppercase font-bold mt-10"
                        >
                            Get Car Price
                        </button>
                    </div>
                </div>
            </div>
            {/* <RegisterForm /> */}
        </>
    )
}

export default LandingPage
