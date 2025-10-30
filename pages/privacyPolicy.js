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
                            <p className="font-semibold">1.⁠ ⁠Introduction</p>
                            <p>
                                At Wheeliyo, we are committed to protecting your
                                privacy. This Privacy Policy outlines how we
                                collect, use, and safeguard your personal
                                information.
                            </p>
                            <p className="font-semibold">
                                2.⁠ ⁠Information We Collect
                            </p>
                            <p>
                                Personal Information: We collect personal
                                details you provide, including name, contact
                                information, and vehicle details. Usage Data: We
                                may collect information about your interactions
                                with our website, such as IP address, browser
                                type, and usage patterns.
                            </p>
                            <p className="font-semibold">
                                3.⁠ ⁠How We Use Your Information
                            </p>
                            <p>
                                To Provide Services: We use your information to
                                generate offers, conduct evaluations, and
                                facilitate transactions. Communication: We may
                                use your contact details to communicate with you
                                regarding offers, evaluations, and other
                                service-related matters.
                            </p>
                            <p>
                                Improvement: We may use usage data to improve
                                our website and services.
                            </p>
                            <p className="font-semibold">
                                4.⁠ ⁠Sharing Your Information
                            </p>
                            <p>
                                Third Parties: We do not share your personal
                                information with third parties except as
                                necessary to provide our services (e.g., for
                                payment processing or evaluation services).
                            </p>
                            <p>
                                Legal Requirements: We may disclose your
                                information if required by law or in response to
                                legal requests.
                            </p>
                            <p className="font-semibold">5.⁠ ⁠Security</p>
                            <p>
                                We implement reasonable security measures to
                                protect your personal information from
                                unauthorized access, use, or disclosure.
                                However, no security system is impenetrable, and
                                we cannot guarantee absolute security.
                            </p>

                            <p className="font-semibold">6.⁠ ⁠Your Rights</p>
                            <p>
                                Access and Correction: You have the right to
                                access and correct your personal information.
                            </p>
                            <p>
                                Opt-Out: You may opt out of receiving
                                promotional communications from us by following
                                the instructions in those communications.
                            </p>
                            <p className="font-semibold">
                                7.⁠ ⁠Changes to This Policy
                            </p>
                            <p>
                                We may update this Privacy Policy from time to
                                time. Changes will be posted on our website with
                                an updated effective date.
                            </p>
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
