import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import API from 'lib/config/axios.config'
import carServices from 'lib/services/cities.services.js'

export default function Signup() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [cities, setCities] = useState([])

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm()

    useEffect(() => {
        carServices.listCities().then((res) => {
            // Try to set cities from common response patterns
            if (Array.isArray(res.data)) {
                setCities(res.data);
            } else if (Array.isArray(res.data.data)) {
                setCities(res.data.data);
            } else if (Array.isArray(res.data.cities)) {
                setCities(res.data.cities);
            } else {
                setCities([]);
            }
        }).catch((err) => {
            console.error('Failed to fetch cities:', err);
            setCities([]);
        });
    }, []);

    const sendOtp = async (data) => {
        setLoading(true)
        try {

            const response = await API.post('/auth/register_or_verify', {
                name: data.name,
                phone: data.phone,
                city: data.city,
                
            })

            // Check if the response indicates success (handle different response structures)
            if (
                response.data.success ||
                response.data.message ||
                response.status === 200
            ) {
                // Store user data temporarily for OTP verification
                localStorage.setItem('tempUserData', JSON.stringify(data))
                toast.success('OTP sent successfully!')

                // Add a small delay to ensure toast shows before redirect
                setTimeout(() => {
                    router.push('/auth/verify-otp')
                }, 1000)
            } else {
                toast.error('Failed to send OTP. Please try again.')
            }
        } catch (error) {
            console.error('Send OTP error:', error)
            console.error('Error response:', error.response?.data)
            toast.error(error.response?.data?.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Head>
                <title>Sign Up - Wheeliyo</title>
                <meta
                    name="description"
                    content="Create your Wheeliyo account"
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link
                            href="/auth/login"
                            className="font-medium text-secondary hover:text-secondary/80"
                        >
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form
                            className="space-y-6"
                            onSubmit={handleSubmit(sendOtp)}
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                        placeholder="John Doe"
                                        {...register('name', {
                                            required: 'Full name is required',
                                            minLength: {
                                                value: 2,
                                                message:
                                                    'Name must be at least 2 characters',
                                            },
                                        })}
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                        placeholder="+919876543210"
                                        {...register('phone', {
                                            required:
                                                'Phone number is required',
                                            pattern: {
                                                value: /^\+91\d{10}$/,
                                                message:
                                                    'Please enter a valid Indian phone number (+919876543210)',
                                            },
                                        })}
                                    />
                                    {errors.phone && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                           
                            <div>
                                <label
                                    htmlFor="city"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    City
                                </label>
                                <div className="mt-1">
                                    <select
                                        id="city"
                                        name="city"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                        {...register('city', {
                                            required: 'City is required',
                                        })}
                                    >
                                        <option value="">Select a city</option>
                                        {cities.map((city) => (
                                            <option
                                                key={city._id || city.id}
                                                value={city.name}
                                            >
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.city && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.city.message}
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
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
