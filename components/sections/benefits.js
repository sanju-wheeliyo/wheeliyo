const BenefitsPage = () => {
    return (
        <div className="lg:flex-row flex flex-col-reverse lg:pr-[86px] w-[93%]  lg:w-full  gap-6 lg:gap-0">
            <div className=" md:flex-[0.6] flex items-center justify-center">
                <img
                    className=" hidden lg:flex w-full md:w-[620px] xl:ml-10 xl:w-[752px] h-full"
                    src={'/assets/benefits_page_car.png'}
                    alt="benefit_page_image"
                />
            </div>
            <div className="xl:ml-8 md:flex-[0.4] mx-auto xl:w-[93%] 3xl:w-[80%]">
                <h6 className="text-secondary md:text-lg uppercase text-base font-bold">
                    Why choose US
                </h6>
                <h2 className="text-primary md:text-4xl mt-2 xl:mt-5 mb-4 xl:mb-10 font-bold text-xl 3xl:w-[90%] ">
                    Quick, Hassle-free, Best Deal!
                </h2>
                <img
                    alt="divider"
                    src={'/assets/divider.png'}
                    width={175}
                    height={100}
                />

                <div className="xl:w-[453px] w-[358px]">
                    <div className="flex items-start gap-4 xl:gap-10 mt-[30px]">
                        <div className="mt-2">
                            <img
                                src="/assets/benefits1.svg"
                                width={60}
                                height={60}
                                alt="benefits-illustration"
                            />
                        </div>
                        <div>
                            <h1 className="text-primary font-bold text-lg  xl:text-xl ">
                                Finest deals & prices in the market
                            </h1>
                            <h1 className="text-primary text-[15px] xl:text-lg ">
                                Enter your car details and get the finest deals
                                & prices.
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 xl:gap-10 py-6">
                        <div className="mt-2">
                            <img
                                src="/assets/benefits2.svg"
                                width={60}
                                height={60}
                                alt="benefits-illustration"
                            />
                        </div>
                        <div>
                            <h1 className="text-primary font-bold text-lg  xl:text-xl w-[251px] xl:w-full">
                                Minimal wait time for selling your car
                            </h1>
                            <h1 className="text-primary text-[15px] xl:text-lg ">
                                Don’t wait to sell your car. Get the best market
                                value for your car instantly.
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 xl:gap-10">
                        <div className="mt-2">
                            <img
                                src="/assets/benefits3.svg"
                                width={60}
                                height={60}
                                alt="benefits-illustration"
                            />
                        </div>
                        <div>
                            <h1 className="text-primary font-bold text-lg  xl:text-xl ">
                                Hassle-free & professional end-to-end doorstep
                                evaluation
                            </h1>
                            <h1 className="text-primary text-[15px] xl:text-lg xl:w-[378px] w-[298px] ">
                                We will help you sell your car safely and
                                securely at your fingertips with a professional
                                end-to-end doorstep evaluation.
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 xl:gap-10 pt-6">
                        <div className="mt-2">
                            <img
                                src="/assets/benefits4.svg"
                                width={60}
                                height={60}
                                alt="benefits-illustration"
                            />
                        </div>
                        <div>
                            <h1 className="text-primary font-bold text-lg  xl:text-xl ">
                                Direct contact with the potential buyer to build
                                trust
                            </h1>
                            <h1 className="text-primary text-[15px] xl:text-lg">
                                Meet your buyer in person before selling your
                                car.
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BenefitsPage
