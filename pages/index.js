import Head from 'next/head'
import LandingPage from 'components/sections/landing'
import HowItWorksPage from 'components/sections/howItWorks'
import BenefitsPage from 'components/sections/benefits'
import ReadyToSellPage from 'components/sections/readyToSell'
import Footer from 'components/sections/footer'
import Header from 'components/header/Header'
import RegisterForm from 'components/form/RegisterForm'
import GoogleHomePixel from 'lib/pixel/GoogleHomePixel'
import Script from 'next/script'
// import { getPlans } from 'lib/services/plans.services'
// import useApi from 'lib/hooks/useApi'
// import { useState } from 'react'
// import { useQuery } from 'react-query'
// import PlansCard from 'components/plans/PlansCard'

export default function Home() {
    // const [leadType, setLeadType] = useState('pre-owned')

    // const handleLeadTypeChange = (updatedLead) => {
    //     setLeadType(updatedLead.toLowerCase())
    // }

    // const Api_getPlans = useApi(getPlans)

    // const fetchDetails = async () => {
    //     const res = await Api_getPlans.request({ type: leadType })
    //     return res?.data?.data || null
    // }

    // const { data: plans, isLoading: plansLoading } = useQuery(
    //     ['plans', leadType],
    //     fetchDetails
    // )

    return (
        <div>
            <Head>
                <title>Wheeliyo - The Greatest Deal for your Cars!</title>
                <meta
                    name="description"
                    content="Sell Your Old Cars at the Best Price in the Market. Safe & Hassle-Free Doorstep Evaluation | Direct Contact with Buyer"
                />
            </Head>

            <GoogleHomePixel />
            <Header />
            <section className="md:relative bg-primary">
                <LandingPage />
            </section>
            <section className="bg-gray-50 py-16">
                <RegisterForm />
                {/* <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Download Our Mobile App
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Get the best car selling experience on your mobile
                            device
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-6">
                        <a
                            href="https://play.google.com/store/apps/details?id=com.wheeliyo"
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary"
                        >
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-white"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-gray-500">
                                    Get it on
                                </div>
                                <div className="text-lg font-semibold text-gray-900">
                                    Google Play
                                </div>
                            </div>
                        </a>

                        <a
                            href="#"
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary"
                        >
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-white"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-gray-500">
                                    Download on the
                                </div>
                                <div className="text-lg font-semibold text-gray-900">
                                    App Store
                                </div>
                            </div>
                        </a>
                    </div>
                </div> */}
            </section>
            <section className="">
                <HowItWorksPage />
            </section>
            <section>
                <BenefitsPage />
            </section>
            {/* <section className="pb-24 flex justify-center">
                <div className="flex flex-col justify-center items-center h-full w-full max-w-[1060px] pt-32 px-4">
                    <h2 className="text-[20px] uppercase text-[#DE317A] font-[700] pb-4">
                        Explore Our Featured Plans
                    </h2>
                    <p className="text-center headline pb-16">
                        Uncover everything you need to close the deal! Our
                        monthly plans provide a comprehensive view of vehicle
                        details, including the vehicle number. Access complete
                        contact details of registered owners to connect
                        directly. Plus, receive real-time notifications for new
                        leads and inquiries, ensuring you never miss a potential
                        sale.
                    </p>

                    <div className="w-full">
                        <div className="w-full flex justify-center pb-8 ">
                            <div
                                className="btn-gradient py-3 px-4 rounded-full
"
                            >
                                <span
                                    onClick={() =>
                                        handleLeadTypeChange('Pre-owned')
                                    }
                                    className={`p-2 px-4 rounded-tl-2xl rounded-full text-white  cursor-pointer border-[#d01768] ${
                                        leadType === 'pre-owned'
                                            ? 'font-semibold'
                                            : 'font-medium opacity-70'
                                    }`}
                                >
                                    Pre-owned
                                </span>
                                <span
                                    onClick={() =>
                                        handleLeadTypeChange('Auction')
                                    }
                                    className={`p-2 px-4 rounded-tr-2xl rounded-full text-white  cursor-pointer border-[#d01768] border-l-0 ${
                                        leadType === 'auction'
                                            ? 'font-semibold'
                                            : 'font-medium opacity-70'
                                    }`}
                                >
                                    Auction
                                </span>
                            </div>
                        </div>
                        <ul className="flex flex-col md:flex-row flex-wrap">
                            {plans &&
                                plans.map((plan, index) => (
                                    <PlansCard
                                        key={index}
                                        item={plan}
                                        index={index}
                                    />
                                ))}
                        </ul>
                    </div>
                </div>
            </section> */}
            <section className="pt-[47px]">
                <ReadyToSellPage />
            </section>
            <section className="lg:h-[195px]">
                <Footer />
            </section>
        </div>
    )
}
