'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import React from 'react'

import useApp from 'lib/hooks/useApp'
import useApi from 'lib/hooks/useApi'
import { useRouter } from 'next/router'
import useToast from 'lib/hooks/useToast'
import Button from 'components/input/Button'
import { errorSetter } from 'lib/utils/helper'
import { login } from 'lib/services/auth.service'
import TextInput from 'components/input/TextInput'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'

import InputPassword from 'components/input/InputPassword'
import NoAuthLayout from 'components/layouts/NoAuthLayout'

function Index() {
    const [apiLoading, setApiLoading] = useState(false)

    // hooks
    const router = useRouter()
    const { success, error } = useToast()
    const { setAuthenticated, fetchUser } = useApp()

    //apis
    const API_login = useApi(login)

    // use forms initialization
    const {
        control,
        setError,
        clearErrors,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    })

    // onsubmit function
    const onSubmit = async () => {
        console.log('Login button clicked')
        clearErrors()

        // Prevent double submission
        if (apiLoading) return

        setApiLoading(true)

        try {
            const params = await new Promise((resolve) => {
                handleSubmit((data) => resolve(data))()
            })

            const payloadData = {
                email: params.email.trim(),
                password: params.password,
            }
            console.log('Submitting login with:', payloadData)

            const response = await API_login.request(payloadData)
            console.log('Login API response:', response)

            if (response?.isError) {
                setApiLoading(false)
                errorSetter(response?.errors, setError)
            } else if (response?.data?.data?.user?.role?.type === 'ADMIN') {
                console.log('Full login response:', response)
                localStorage.setItem(
                    'accessToken',
                    response?.data?.data?.accessToken
                )
                localStorage.setItem(
                    'refreshToken',
                    response?.data?.data?.refreshToken
                )
                success('You are successfully logged in')
                setAuthenticated(true)
                await fetchUser()
                setApiLoading(false)
                router.push('/admin/leads/recently-added')
            } else {
                error('Permission denied!')
                setApiLoading(false)
                return null
            }
        } catch (error) {
            console.error('Login error:', error)
            setApiLoading(false)
        }
    }

    return (
        <>
            <div className="w-full h-screen flex justify-between items-center p-4 lg:pl-[15%] flex-col lg:flex-row">
                <div className="w-full max-w-[380px] flex flex-col justify-center">
                    <div className="w-full p-2 flex justify-center">
                        <div className="w-full max-w-[206px]">
                            <img className="w-full" src="/assets/logo.svg" />
                        </div>
                    </div>
                    <div className="w-full p-2 pb-8 text-center text-[#475569] flex justify-center">
                        <p className="max-w-[250px] plus-jakarta-sans">
                            Hey, Enter your details to get sign in to your
                            account
                        </p>
                    </div>
                    <div className="w-full p-2 plus-jakarta-sans">
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
                                    error={errors.email}
                                    onChange={(e) =>
                                        onChange(
                                            e.target.value.replace(/\s+/g, '')
                                        )
                                    }
                                    className="!rounded-full p-3 border border-solid border-[#94A3B8]"
                                />
                            )}
                            name="email"
                        />
                    </div>
                    <div className="w-full p-2 plus-jakarta-sans">
                        <Controller
                            control={control}
                            rules={{
                                required: 'Password is required',
                            }}
                            render={({ field: { onChange, value } }) => (
                                <InputPassword
                                    value={value}
                                    onChange={onChange}
                                    error={errors.password}
                                    placeholder="Enter password"
                                />
                            )}
                            name="password"
                        />
                    </div>
                    <div className="w-full p-2 flex justify-end ">
                        <Link
                            className="underline text-[#0648AA] weight-6"
                            href="/admin/auth/forgot-password"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    <div className="w-full p-2 pt-8">
                        <Button
                            loading={apiLoading}
                            onClick={onSubmit}
                            disabled={API_login.loading}
                        >
                            Login
                        </Button>
                    </div>
                </div>
                <div className="w-full max-w-[1000px]">
                    <img className="w-full" src="/assets/login/banner.png" />
                </div>
            </div>
        </>
    )
}
Index.layout = NoAuthLayout
export default Index
