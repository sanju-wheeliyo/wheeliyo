import Loader from 'components/display/Loader'
import useApi from 'lib/hooks/useApi'
import { paymentStatus } from 'lib/services/plans.services'
import { useRouter } from 'next/router'
import { PaymentFailure, PaymentSuccess } from 'public/assets/common/icons'
import { useEffect, useState } from 'react'

const PaymentStatus = () => {
    const [loader, setLoader] = useState(true)
    const [isSuccess, setIsSuccess] = useState()

    const router = useRouter()

    const API_Payment_Status = useApi(paymentStatus)

    async function statusCheck(merchantTransactionId) {
        try {
            const response = await API_Payment_Status.request({
                merchantTransactionId,
            })
            console.log(response)

            if (!response.isError) {
                setIsSuccess(true)
                setLoader(false)
                localStorage.removeItem('merchantTransactionId')
            }
        } catch (error) {
            console.log(error)

            setLoader(false)
        }
    }

    useEffect(() => {
        const merchantTransactionId = localStorage.getItem(
            'merchantTransactionId'
        )
        if (!merchantTransactionId) {
            router.push('/')
        } else {
            statusCheck(merchantTransactionId)
        }
    }, [])

    return (
        <>
            {/* <Header /> */}
            <div className="flex h-[calc(100vh-150px)] justify-center">
                {loader ? (
                    <Loader />
                ) : (
                    <div className="flex flex-col justify-center items-center h-full text-center mx-5 lg:mx-10 gap-7 w-[620px]">
                        {isSuccess ? <PaymentSuccess /> : <PaymentFailure />}

                        <h1 className="lg:text-2xl text-base font-bold">
                            {isSuccess ? 'Thank you !' : 'Sorry !'}
                            <br />
                            <br />
                            <span className="font-medium">
                                {isSuccess
                                    ? 'Your payment has been successfully processed.'
                                    : 'Your payment has been failed. Try again.'}
                            </span>
                        </h1>
                        <button
                            onClick={() => router.push('/')}
                            className="w-[215px] h-[50px] linear-gradient-button rounded-md text-white"
                        >
                            Home
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default PaymentStatus
