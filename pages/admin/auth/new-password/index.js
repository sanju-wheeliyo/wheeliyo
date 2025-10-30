'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'

import useApi from 'lib/hooks/useApi'
import Button from 'components/input/Button'
import TextInput from 'components/input/TextInput'
import { resetPassword } from 'lib/services/auth.service'
import useToast from 'lib/hooks/useToast'
import { errorSetter } from 'lib/utils/helper'
import { useRouter } from 'next/router'
import InputPassword from 'components/input/InputPassword'

export default function Index() {
    const [loading, setLoading] = useState()

    const router = useRouter()
    const { success, error } = useToast()
    const API_resetPassword = useApi(resetPassword)

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
            password: '',
            confirm_password: '',
        },
    })

    const onSubmit = async () => {
        clearErrors()
        handleSubmit(async (params) => {
            setLoading(true)
            const payloadData = {
                is_forget_password: true,
                password: params.password,
                confirm_password: params.confirm_password,
            }

            try {
                const response = await API_resetPassword.request(payloadData)
                if (response?.isError) {
                    setLoading(false)
                    error(
                        'There was an issue updating your password. Please try again.'
                    )
                    errorSetter(response?.errors, setError)
                } else {
                    success(
                        'Your password has been successfully updated. You can now log in with your new password.',
                        {
                            autoClose: 4000, // Show for 4 seconds
                            position: 'top-center',
                        }
                    )
                    // Add a delay to ensure the toast is visible before redirect
                    setTimeout(() => {
                        router.push('/admin/auth/login')
                    }, 2500) // 2.5 second delay
                }
                setLoading(false)
            } catch (error) {
                setLoading(false)
                error('An unexpected error occurred. Please try again.')
            }
        })()
    }

    return (
        <>
            <header className="w-full absolute lg:static  p-4 flex items-center">
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
                <div className="w-full max-w-[380px] flex flex-col justify-center">
                    <div className="w-full p-2 flex justify-center !plus-jakarta-sans">
                        <h1 className="plus-jakarta-sans">
                            Create New Password
                        </h1>
                    </div>
                    <div className="w-full p-2 pb-8 text-center text-[#475569] flex justify-center">
                        <p className="w-full plus-jakarta-sans">
                            Please enter and confirm your new password You will
                            need to login after you reset.
                        </p>
                    </div>
                    <div className="w-full p-2 relative">
                        <Controller
                            control={control}
                            rules={{
                                required: 'Password is required',
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/,
                                    message:
                                        'Password should be 8 to 15 characters with at least one special character , one numeric, one small case and one upper case letter',
                                },
                                minLength: {
                                    value: 8,
                                    message:
                                        'Password must be at least 8 characters long!',
                                },
                                maxLength: {
                                    value: 15,
                                    message:
                                        'Password must be less than 15 characters!',
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                // <TextInput
                                //     value={value}
                                //     onChange={onChange}
                                //     error={errors.password}
                                //     placeholder="Create new password"
                                // />
                                <InputPassword
                                    value={value}
                                    onChange={onChange}
                                    error={errors.password}
                                    placeholder="Create new password"
                                />
                            )}
                            name="password"
                        />
                    </div>
                    <div className="w-full p-2">
                        <Controller
                            control={control}
                            rules={{
                                required: 'Confirm password is required',
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/,
                                    message:
                                        'Confirm password should be 8 to 15 characters with at least one special character , one numeric, one small case and one upper case letter',
                                },
                                minLength: {
                                    value: 8,
                                    message:
                                        'Confirm password must be at least 8 characters long!',
                                },
                                maxLength: {
                                    value: 15,
                                    message:
                                        'Confirm password must be less than 15 characters!',
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                // <TextInput
                                //     value={value}
                                //     onChange={onChange}
                                //     error={errors.confirm_password}
                                //     placeholder="Confirm  new password"
                                // />
                                <InputPassword
                                    value={value}
                                    onChange={onChange}
                                    error={errors.confirm_password}
                                    placeholder="Confirm  new password"
                                />
                            )}
                            name="confirm_password"
                        />
                    </div>
                    {/* <div className="w-full p-2 relative">
                        <input
                            placeholder="Enter password"
                            type="password"
                            className="w-full rounded-full p-3 border border-solid border-[#94A3B8] pr-12"
                        />
                        <span className="w-5 block absolute right-8 top-6 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/eye-off.svg"
                            />
                        </span>
                    </div> */}
                    <div className="w-full p-2 pt-8">
                        <Button
                            loading={loading}
                            onClick={onSubmit}
                            disabled={API_resetPassword.loading}
                        >
                            Reset Password
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
