const HowItWorksPage = () => {
    return (
        <>
            <div className="md:text-center w-[90%] md:w-full mx-auto md:ml-0 flex flex-col md:items-center xl:mt-[85px]">
                <div
                    className=" h-[1px] absolute -mt-28"
                    id="how-it-works"
                ></div>
                <h6 className="text-secondary font-bold  xl:text-xl text-base">
                    HOW IT WORKS
                </h6>
                <h2 className="text-primary md:text-3xl text-xl font-bold mt-1 my-6">
                    Three EASY Steps!
                </h2>
                <img
                    alt="divider"
                    src={'/assets/divider.png'}
                    className="md:w-[175px] w-[88px]  h-1  -z-10"
                />
            </div>
            <div className="lg:flex-row flex flex-col justify-between w-[90%] 3xl:w-[80%] mx-auto xl:my-14 mb-14 items-center xl:items-start font-normal">
                <div className="w-[16rem] flex text-center flex-col relative justify-center items-center">
                    <img
                        alt="illustration"
                        className=" h-44 w-44  -z-10"
                        
                        src="/assets/howitworks1.png"
                    />
                    <h1 className="text-primary mt-4 text-base xl:text-[18px]">
                        Enter your car details to get a Free Quote.
                    </h1>
                    <div className="absolute xl:block hidden w-[193px] h-[23px] top-[38%] right-[20px] translate-x-full  -z-10">
                        <img alt="arrow" src={'/assets/down_arrow.png'}  />
                    </div>
                </div>
                <div className="w-[22rem] relative flex text-center lg:ml-[65px]  flex-col justify-center items-center">
                    <img
                        alt="illustration"
                        className=" h-44 w-44  -z-10"
                        
                        src="/assets/howitworks2.png"
                    />

                    <h1 className="text-primary mt-4 text-base xl:text-[18px]">
                        Complete Doorstep evaluation- Professional end-to-end
                        evaluation at the comfort of your doorstep with an
                        assurance of getting the best price quote.
                    </h1>

                    <div className="absolute xl:block hidden  -z-10  w-[193px] h-[23px] top-[38%] right-[20px] translate-x-full">
                        <img alt="arrow" src={'/assets/up_arrow.png'}  />
                    </div>
                </div>
                <div className="w-[22rem] flex text-center flex-col justify-center items-center">
                    <img
                        alt="illustration"
                        className=" h-44 w-44  -z-10"
                        
                        src="/assets/howitworks3.png"
                    />
                    <h1 className="text-primary mt-4 text-base xl:text-[18px]">
                        Get notified instantly to the best buyers & conveniently
                        connect with the best possible buyer to sell worry-free.
                    </h1>
                </div>
            </div>
            <div className=" h-[1px] absolute -mt-28" id="benefits"></div>
        </>
    )
}

export default HowItWorksPage
