import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import API from 'lib/config/axios.config'

export default function VerifyOtp() {
    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState(null)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        // Check if this is a login or signup flow
        const isLogin = router.query.type === 'login'

        if (isLogin) {
            // Login flow - get phone from localStorage
            const storedPhone = localStorage.getItem('tempLoginPhone')
            if (storedPhone) {
                setUserData({ phone: storedPhone })
            } else {
                // Redirect to login if no phone data
                router.push('/auth/login')
            }
        } else {
            // Signup flow - get user data from localStorage or query params
            const storedUserData = localStorage.getItem('tempUserData')
            if (storedUserData) {
                setUserData(JSON.parse(storedUserData))
            } else if (router.query.userData) {
                setUserData(
                    JSON.parse(decodeURIComponent(router.query.userData))
                )
            } else {
                // Redirect to signup if no user data
                router.push('/auth/signup')
            }
        }
    }, [router])

    const verifyOtp = async (data) => {
        setLoading(true)
        try {
            // Use different API endpoints for login vs signup
            const endpoint =
                router.query.type === 'login'
                    ? '/auth/login_verify_otp'
                    : '/auth/register_verify_otp'
            // Send all fields for registration, only phone/otp for login
            const payload =
                router.query.type === 'login'
                    ? { phone: userData.phone, otp: data.otp }
                    : {
                        phone: userData.phone,
                        otp: data.otp,
                        name: userData.name,
                        city: userData.city,
                        type: 'phone',
                        value: userData.phone,
                    }

            const response = await API.post(endpoint, payload)

            if (response.data.status === 200) {

                // Store tokens
                const accessToken = response.data.data.accessToken
                const refreshToken = response.data.data.refreshToken
                const user = response.data.data.user

                localStorage.setItem('accessToken', accessToken)
                localStorage.setItem('refreshToken', refreshToken)
                localStorage.setItem('user', JSON.stringify(user))

                // Clear temporary data
                if (router.query.type === 'login') {
                    localStorage.removeItem('tempLoginPhone')
                } else {
                    localStorage.removeItem('tempUserData')
                }

                toast.success(
                    router.query.type === 'login'
                        ? 'Login successful!'
                        : 'Registration successful!'
                )

                // Add a small delay to ensure localStorage is updated
                setTimeout(() => {
                    // Always redirect to dashboard after successful verification
                    router.push('/dashboard')
                }, 100)
            }
        } catch (error) {
            console.error('Verify OTP error:', error)
            console.error('Error response:', error.response?.data)
            if (error.response?.data?.errors) {
                console.error('Validation errors:', error.response.data.errors);
            }
            toast.error(error.response?.data?.message || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const resendOtp = async () => {
        if (!userData) return

        setLoading(true)
        try {
            const isLogin = router.query.type === 'login'

            // Use different API endpoints for login vs signup
            const endpoint = isLogin
                ? '/auth/login'
                : '/auth/register_or_verify'
            const payload = isLogin
                ? { phone: userData.phone }
                : {
                      name: userData.name,
                      phone: userData.phone,
                      city: userData.city,
                    
                  }

            const response = await API.post(endpoint, payload)

            if (response.data.status === 200) {
                toast.success('OTP resent successfully!')
            }
        } catch (error) {
            console.error('Resend OTP error:', error)
            toast.error(error.response?.data?.message || 'Failed to resend OTP')
        } finally {
            setLoading(false)
        }
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Verify OTP - Wheeliyo</title>
                <meta
                    name="description"
                    content="Verify your OTP to complete registration"
                />
            </Head>

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link href="/">
                        <img
                            className="mx-auto h-12 w-auto"
                            src="/assets/logo.svg"
                            alt="Wheeliyo"
                        />
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verify your phone number
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        We've sent a verification code to{' '}
                        <span className="font-medium text-secondary">
                            {userData.phone}
                        </span>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit(verifyOtp)}
                        >
                            <div>
                                <label
                                    htmlFor="otp"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Enter OTP
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        autoComplete="one-time-code"
                                        required
                                        maxLength="6"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm text-center text-lg tracking-widest"
                                        placeholder="000000"
                                        {...register('otp', {
                                            required: 'OTP is required',
                                            pattern: {
                                                value: /^\d{6}$/,
                                                message:
                                                    'Please enter a valid 6-digit OTP',
                                            },
                                        })}
                                    />
                                    {errors.otp && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.otp.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white linear-gradient-button disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    disabled={loading}
                                    className="text-sm text-secondary hover:text-secondary/80 disabled:opacity-50"
                                >
                                    Didn't receive OTP? Resend
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Need help?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <Link
                                    href={
                                        router.query.type === 'login'
                                            ? '/auth/login'
                                            : '/auth/signup'
                                    }
                                    className="font-medium text-secondary hover:text-secondary/80"
                                >
                                    Back to{' '}
                                    {router.query.type === 'login'
                                        ? 'login'
                                        : 'signup'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
