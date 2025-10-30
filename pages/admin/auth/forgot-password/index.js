'use client'

import Link from 'next/link'
import useApp from 'lib/hooks/useApp'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Button from 'components/input/Button'
import TextInput from 'components/input/TextInput'

export default function Index() {
    // states
    const [loading, setLoading] = useState(false)

    // hooks
    const auth = useApp()
    const router = useRouter()

    // use forms initialization
    const {
        control,
        setError,
        setValue,
        clearErrors,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            value: '',
        },
    })

    // onsubmit function
    const onSubmit = async (data) => {
        clearErrors()
        setLoading(true)
        const payloadData = {
            type: 'email',
            value: data.value.trim(),
            is_forget_password: true,
        }
        localStorage.setItem('email', data.value)
        const res = await auth?.handleSendOtp(payloadData)
        setLoading(false)
    }

    return (
        <>
            <header className="w-full  p-4 absolute lg:static flex items-center">
                <div className="w-auto pr-4">
                    <div
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full p-4 bg-[#F1F5F9] flex justify-center items-center  block cursor-pointer"
                    >
                        <img
                            className="w-3 h-3 object-contain"
                            src="/assets/common/back.png"
                            alt="Back"
                        />
                    </div>
                </div>
                <div className="w-full max-w-[206px]">
                    <img
                        onClick={() => router.push('/admin/auth/login')}
                        className="w-full cursor-pointer"
                        src="/assets/logo.svg"
                        alt="Logo"
                    />
                </div>
            </header>
            <div className="w-full p-4 h-screen flex justify-center items-center">
                <div className="w-full max-w-[395px] flex flex-col justify-center">
                    <div className="w-full p-2 flex justify-center">
                        <h2 className="plus-jakarta-sans">Forgot Password</h2>
                    </div>
                    <div className="w-full p-2 pb-8 text-center text-[#475569] flex justify-center">
                        <p className="text-[18px] plus-jakarta-sans">
                            No worries! Enter your email address below and we
                            will send you a code to reset password.
                        </p>
                    </div>
                    <div className="w-full p-2">
                        <Controller
                            control={control}
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
                                    message: 'Email is invalid.',
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    placeholder="Enter email address"
                                    value={value}
                                    error={errors.value}
                                    onChange={(e) =>
                                        onChange(
                                            e.target.value.replace(/\s+/g, '')
                                        )
                                    }
                                    className="!rounded-full p-3 border border-solid border-[#94A3B8]"
                                />
                            )}
                            name="value"
                        />
                    </div>

                    <div className="w-full p-2 pt-8">
                        <Button
                            loading={loading}
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                        >
                            Verify email
                        </Button>
                    </div>
                    <div className="w-full flex justify-center p-2">
                        <p>
                            Back to{' '}
                            <Link
                                className="underline text-[#0648AA]"
                                href="/admin/auth/login"
                            >
                                login?
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
