import Link from 'next/link'

const ReadyToSellPage = () => {
    return (
        <div className="flex justify-center  items-center h-full  md:mx-0 md:mt-10 w-[90%] md:w-full mx-auto">
            <div className="w-[90%] md:h-80 h-[301px] rounded-xl ready-to-sell-bg flex flex-col lg:px-10 md:mx-20 justify-center items-center">
                <h1 className="text-white md:text-4xl text-xl font-semibold">
                    Ready to sell your car?
                </h1>
                <h1 className="lg:py-8 py-2 px-4 xl:px-40 text-center w-[341px] xl:max-w-[1200px] md:w-full   text-white text-[16px]">
                    Get access to potential buyers, as well as tools and
                    resources to help you get the most out of your selling
                    experience at Wheeliyo. Let us help you turn your car into
                    cash. List your vehicle today!
                </h1>
                <button
                    onClick={() =>
                        window.open(
                            'https://play.google.com/store/apps/details?id=com.wheeliyo',
                            '_blank'
                        )
                    }
                    className="bg-primary-dark p-3 mt-[13px] lg:mt-0 w-[196px] lg:w-[314px] rounded-md text-white linear-gradient-button"
                >
                    Sell your car
                </button>
            </div>
            <div className=" h-[1px] absolute -mt-28" id="get-in-touch"></div>
        </div>
    )
}

export default ReadyToSellPage
