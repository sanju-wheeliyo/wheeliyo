'use client'

import useApi from 'lib/hooks/useApi'
import useApp from 'lib/hooks/useApp'
import { makPayment } from 'lib/services/plans.services'

export default function PlansCard({ item, index }) {
    // console.log(item)
    const { user } = useApp()
    const API_makePayment = useApi(makPayment)

    async function checkoutPayment() {
        const response = await API_makePayment.request({
            user_id: '66ec1a6fdf1e6689df83bfac',
            price: 1,
            phone: '9841231121',
            name: 'Suhail',
            plan_id: item?._id,
        })
        console.log(response)

        if (!response.isError) {
            localStorage.setItem(
                'merchantTransactionId',
                response.data.transactionId
            )
            window.location.href = response.data.url
        }
    }

    console.log('====================================')
    console.log(user)
    console.log('====================================')

    return (
        <li
            // key={index}
            className={`w-full md:w-1/3 pb-4 ${
                index === 1 ? 'scale-100' : 'scale-100 md:scale-75'
            }`}
        >
            {console.log(index)}
            <div className="w-full rounded-2xl border-2 border-solid border-[#D01768] p-6 text-center pt-20 relative">
                <span
                    className={`flex justify-center items-center w-auto absolute right-6 top-6 h-8 leading-[10px] bg-primary-dark p-3 rounded-full text-white linear-gradient-button ${
                        index === 1 ? 'visible' : 'hidden'
                    }`}
                >
                    <span className={`w-5 h-5 block`}>
                        <img
                            className="w-full"
                            src="../assets/bladge-icon.png"
                        />
                    </span>
                    <span className="pl-1">plans</span>
                </span>
                <h3 className="text-3xl text-[#DE317A] font-[700] pb-6">
                    {item?.title}
                </h3>
                <ul className="flex flex-col justify-start items-start text-left pb-8 backdots">
                    {item?.features?.map((feature, i) => (
                        <li key={i} className="pb-4">
                            {feature.value}
                        </li>
                    ))}
                    {/* <li className="pb-4">
                        View detailed vehicle history, including vehicle number
                    </li>
                    <li className="pb-4">
                        Access complete contact details of registered car owners
                    </li>
                    <li className="pb-4">Customer Support</li>
                    <li className="pb-4">
                        Receive real-time notifications for new leads and
                        inquiries through mail, WhatsApp ,
                    </li>
                    <li className="pb-4">
                        Access to Bank Auction Cars across India
                    </li> */}
                </ul>
                <span className="w-full block text-2xl text-[#DE317A] font-semibold pb-2">
                    ₹{item?.amount}
                </span>
                <span>
                    <button
                        // onClick={checkoutPayment}
                        className="w-48 bg-primary-dark p-3 rounded-full text-white linear-gradient-button"
                    >
                        Choose Plan
                    </button>
                </span>
            </div>
        </li>
    )
}
