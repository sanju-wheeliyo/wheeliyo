'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'

import useApi from 'lib/hooks/useApi'
import Button from 'components/input/Button'
import TextInput from 'components/input/TextInput'
import { verifyOtp } from 'lib/services/auth.service'
import Timer from 'components/display/Timer'
import useOtpTimer from 'lib/hooks/useTimer'
import useToast from 'lib/hooks/useToast'
import { useRouter } from 'next/router'
import useApp from 'lib/hooks/useApp'

export default function Index() {
    const [loading, setLoading] = useState()
    const [email, setEmail] = useState('')
    const auth = useApp()
    const router = useRouter()
    const { error, success } = useToast()
    const API_verifyOtp = useApi(verifyOtp)
    const { seconds, resetTimer } = useOtpTimer(180)

    const {
        watch,
        control,
        setError,
        setValue,
        getValues,
        clearErrors,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            otp: '',
        },
    })

    useEffect(() => {
        const userEmail = localStorage.getItem('email')
        setEmail(userEmail)
    }, [])

    const onSubmit = async () => {
        clearErrors()
        handleSubmit(async (params) => {
            setLoading(true)
            const payloadData = {
                otp: params.otp,
                type: 'email',
                value: email,
                is_forget_password: true,
            }

            try {
                const response = await API_verifyOtp.request(payloadData)
                localStorage.setItem(
                    'accessToken',
                    response?.data?.data?.accessToken
                )
                localStorage.setItem(
                    'refreshToken',
                    response?.data?.data?.refreshToken
                )
                if (response && response?.isError) {
                    error(
                        'The OTP entered is incorrect or has expired. Please try again.'
                    )
                    setLoading(false)
                    return null
                } else {
                    success(
                        'OTP has been successfully verified. Please create a new password.'
                    )
                    router.push('/admin/auth/new-password')
                    setLoading(false)
                }
            } catch (error) {
                setLoading(false)
            }
        })()
    }

    const handleOtpSend = async (params) => {
        setLoading(true)
        const email = localStorage.getItem('email')

        const payloadData = {
            type: 'email',
            value: email,
            is_forget_password: true,
        }
        const res = await auth?.handleSendOtp(payloadData)
        setLoading(false)
        resetTimer()
    }

    console.log('====================================')
    console.log(seconds)
    console.log('====================================')

    const forgotBack = () => {
        // scrollToTop()
        router.push('/admin/auth/login/')
    }

    return (
        <>
            <header className="w-full absolute lg:static p-4 flex items-center">
                <div className="w-auto pr-4">
                    <div
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full p-4 bg-[#F1F5F9] flex justify-center items-center cursor-pointer"
                    >
                        <img
                            className="w-3 h-3 object-contain"
                            src="/assets/common/back.png"
                            alt="Back"
                        />
                    </div>
                </div>
                <div className="w-full max-w-[206px]">
                    <img className="w-full" src="/assets/logo.svg" />
                </div>
            </header>
            <div className="w-full p-4 h-screen flex justify-center items-center">
                <div className="w-full max-w-[420px] flex flex-col justify-center">
                    <div className="w-full p-2 flex justify-center">
                        <h1 className="plus-jakarta-sans">Verify Account</h1>
                    </div>
                    <div className="w-full p-2 pb-8 text-center text-[#475569] flex justify-center">
                        <p className="plus-jakarta-sans text-[#1E293B] text-[18px]">
                            Code has been send to
                            <span className="text-[#1E293B] font-semibold plus-jakarta-sans pl-[10px]">
                                {email}
                            </span>
                            <br /> Enter the code to verify your account.
                        </p>
                    </div>

                    <div className="w-full p-2">
                        <Controller
                            control={control}
                            rules={{
                                required: 'Otp is required',
                                maxLength: {
                                    value: 4,
                                    message: 'Maxium limit is 4',
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    type="number"
                                    value={value}
                                    onChange={onChange}
                                    error={errors.otp}
                                    placeholder="Enter 4 digit code"
                                    className="!rounded-full p-3 border border-solid border-[#94A3B8]"
                                />
                            )}
                            name="otp"
                        />
                    </div>

                    <div className="w-full p-2 pt-8">
                        <Button
                            loading={loading}
                            onClick={onSubmit}
                            disabled={API_verifyOtp.loading}
                        >
                            Verify Account
                        </Button>
                    </div>
                    <div className="w-full p-2 flex flex-col justify-center items-center">
                        {!seconds && (
                            <p>
                                Didn’t Receive Code?{' '}
                                <span
                                    className="underline text-[#0648AA] cursor-pointer"
                                    onClick={() => {
                                        !seconds && handleOtpSend()
                                    }}
                                >
                                    Resend Code
                                </span>
                            </p>
                        )}

                        <p className="flex gap-2">
                            {seconds &&
                                ' Resend code in ' +
                                    (Math.floor(seconds / 60) +
                                        ':' +
                                        ((seconds % 60).toString().length < 2
                                            ? `0${seconds % 60}`
                                            : seconds % 60))}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
