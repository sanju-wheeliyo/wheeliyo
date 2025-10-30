import Header from 'components/header/Header'
import Head from 'next/head'
import Footer from 'components/sections/footer'
import ReadyToSellPage from 'components/sections/readyToSell'

const PrivacyPolicy = () => {
    return (
        <div>
            <Head>
                <title>Wheeliyo</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <div className=" relative">
                <img
                    alt="bg"
                    className="w-screen"
                    src="/assets/privacy-policy-bg.svg"
                />
                <div className="absolute-center text-white text-center">
                    <h1 className="xl:text-3xl text-base xl:mb-2 md:text-xl">
                        Privacy Policy
                    </h1>
                </div>
            </div>
            <div className="flex justify-center items-center px-4 lg:px-10">
                <div className="w-[1064px] min-h-[200px] bg-white rounded-3xl shadow-xl px-[16px] lg:px-[28px] py-[34px]">
                    <div>
                        <h1 className="text-secondary text-xl font-bold pt-4">
                            Privacy policy
                        </h1>
                        <div className="flex-col flex gap-5 mt-4 text-base md:text-lg">
                            <h1 className="text-[#231F20] ">
                                At Wheeliyo, we recognize the importance of
                                maintaining our User privacy. We value your
                                privacy and appreciate the trust you place in
                                us.
                            </h1>
                            <h1 className="text-[#231F20] ">
                                This Privacy Policy talks about how we treat the
                                user information we collect on the website.
                            </h1>
                            <h1 className="text-[#231F20] ">
                                This Privacy Policy applies to present and
                                former website visitors and our online
                                customers. By visiting and/or using our website,
                                you agree to this Privacy Policy.
                            </h1>
                            <h1 className="text-[#231F20] ">
                                We might collect your contact information and
                                any information that you post on third-party
                                social media channels.
                            </h1>
                            <h1 className="text-[#231F20] ">
                                We might also collect information related to
                                your demographics, and information related to
                                your device, IP address, and your browser.
                            </h1>
                            <h1 className="text-[#231F20] ">
                                We collect information directly from you, from
                                other websites/ third parties, and from tracking
                                you through analytics.
                            </h1>
                            <h1 className="text-[#231F20] ">
                                All the information we collect is used to
                                contact you, engage with you, improve our
                                product, keep you informed of our updates, study
                                customer trends and expectations, and for
                                transactional purposes, as required.
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
            <section id="get-in-touch" className="pt-[47px]">
                <ReadyToSellPage />
            </section>
            <section className="lg:h-[195px] bottom-0">
                <Footer />
            </section>
        </div>
    )
}

export default PrivacyPolicy
