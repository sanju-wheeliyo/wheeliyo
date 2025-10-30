'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import UserLayout from 'components/layouts/UserLayout'
import BrandModal from 'components/modals/BrandModal'
import ModelsModal from 'components/modals/ModelsModal'
import YearsModal from 'components/modals/YearsModal'
import VariantsModal from 'components/modals/VariantsModal'
import KmsModal from 'components/modals/KmsModal'
import StatesModal from 'components/modals/StatesModal'
import SpinnerLoader from 'components/loaders/SpinnerLoader'
import carServices from 'lib/services/car.services'
import useApi from 'lib/hooks/useApi'
import useToast from 'lib/hooks/useToast'
import useApp from 'lib/hooks/useApp'

export default function SellerPage() {
    const router = useRouter()
    const { success, error } = useToast()
    const { user } = useApp()
    const API_getPrice = useApi(carServices.getPrice)

    const [datas, setDatas] = useState({
        name: '',
        email: '',
        mobile: '+91',
        sendUpdatesOnWhatsapp: true, // Always true
        carNumber: '',
        carBrand: '',
        carYear: '',
        carModel: '',
        carVariant: '',
        carState: '',
        minKilometers: '',
        maxKilometers: '',
    })

    const [selected, setSelected] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Auto-populate user data on component mount
    useEffect(() => {
        if (user) {
            setDatas((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                mobile: user.phone || '+91',
                sendUpdatesOnWhatsapp: true,
            }))
        }
    }, [user])

    const clearData = () => {
        setDatas({
            name: user?.name || '',
            email: user?.email || '',
            mobile: user?.phone || '+91',
            sendUpdatesOnWhatsapp: true,
            carNumber: '',
            carBrand: '',
            carYear: '',
            carModel: '',
            carVariant: '',
            carState: '',
            minKilometers: '',
            maxKilometers: '',
        })
    }

    const showModal = (item, prevItem) => {
        if (selected === item) return setSelected('')

        // Since basic info is pre-filled, we can start with brand selection
        if (item === 'carBrand') {
            setSelected(item)
            return
        }

        if (datas[prevItem] !== '') setSelected(item)
        else
            error(
                'This is a one-way form. Please complete each step in order. You cannot skip steps or fill them out of order.'
            )
    }

    const handleSubmit = async () => {
        setSelected('')
        setIsLoading(true)

        const submitData = {
            owner: {
                name: datas?.name,
                contact: datas?.mobile,
            },
            vehicle: {
                number: datas?.carNumber,
                brand_id: datas?.carBrand?._id,
                model_id: datas?.carModel?._id,
                variant_id: datas?.carVariant?._id,
                year_of_manufacture: datas?.carYear,
                registered_state: datas?.carState?.key,
                min_kilometers: datas?.minKilometers,
                max_kilometers: datas?.maxKilometers,
            },
            car_type: 'pre-owned',
        }

        try {
            const response = await API_getPrice.execute(submitData)
            if (response?.data?.status === 200) {
                setIsLoading(false)
                success('Car submitted successfully!')
                router.push('/dashboard/leads')
                clearData()
            }
        } catch (err) {
            console.log(err)
            setIsLoading(false)
            error('Failed to submit car')
        }
    }

    return (
        <UserLayout>
            <div className="w-full">
                <div className="w-full bg-white rounded-2xl p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Sell Your Car
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Fill in the details below to get the best price for your
                        car
                    </p>
                </div>

                <div
                    className={`w-full ${selected !== '' ? 'mb-[400px]' : ''}`}
                >
                    <div className="w-full bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row text-center py-6 justify-center lg:justify-around items-center h-full text-gray">
                            {/* Brand */}
                            <div className="relative w-full lg:w-auto mb-4 lg:mb-0">
                                <div
                                    className={`p-5 mx-3 bg-gray-100 lg:bg-white lg:rounded-xl ${
                                        selected !== ''
                                            ? 'rounded-t-xl'
                                            : 'rounded-xl'
                                    } cursor-pointer select-none flex justify-between`}
                                    onClick={() => showModal('carBrand')}
                                >
                                    <div className="text-left">
                                        <p>Brand</p>
                                        <p className="font-semibold">
                                            {datas.carBrand?.name}
                                        </p>
                                    </div>
                                    <span className="lg:hidden">
                                        {selected === 'carBrand' ? (
                                            <ChevronDownIcon className="w-5 h-5 text-pink-600" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5" />
                                        )}
                                    </span>
                                </div>
                                {selected === 'carBrand' && (
                                    <BrandModal
                                        datas={datas}
                                        setDatas={setDatas}
                                        setSelected={setSelected}
                                    />
                                )}
                            </div>

                            <img
                                alt="divider"
                                width={2}
                                className="hidden lg:block"
                                src="/assets/hori_divider.png"
                            />

                            {/* Model */}
                            <div className="relative w-full lg:w-auto mb-4 lg:mb-0">
                                <div
                                    className={`p-5 mx-3 bg-gray-100 lg:bg-white lg:rounded-xl ${
                                        selected !== ''
                                            ? 'rounded-t-xl'
                                            : 'rounded-xl'
                                    } cursor-pointer select-none flex justify-between`}
                                    onClick={() =>
                                        showModal('carModel', 'carBrand')
                                    }
                                >
                                    <div className="text-left">
                                        <p>Model</p>
                                        <p className="font-semibold">
                                            {datas.carModel?.name}
                                        </p>
                                    </div>
                                    <span className="lg:hidden">
                                        {selected === 'carModel' ? (
                                            <ChevronDownIcon className="w-5 h-5 text-pink-600" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5" />
                                        )}
                                    </span>
                                </div>
                                {selected === 'carModel' && (
                                    <ModelsModal
                                        datas={datas}
                                        setDatas={setDatas}
                                        setSelected={setSelected}
                                    />
                                )}
                            </div>

                            <img
                                alt="divider"
                                width={2}
                                className="hidden lg:block"
                                src="/assets/hori_divider.png"
                            />

                            {/* Year */}
                            <div className="relative w-full lg:w-auto mb-4 lg:mb-0">
                                <div
                                    className={`p-5 mx-3 bg-gray-100 lg:bg-white lg:rounded-xl ${
                                        selected !== ''
                                            ? 'rounded-t-xl'
                                            : 'rounded-xl'
                                    } cursor-pointer select-none flex justify-between`}
                                    onClick={() =>
                                        showModal('carYear', 'carModel')
                                    }
                                >
                                    <div className="text-left">
                                        <p>Year</p>
                                        <p className="font-semibold">
                                            {datas.carYear}
                                        </p>
                                    </div>
                                    <span className="lg:hidden">
                                        {selected === 'carYear' ? (
                                            <ChevronDownIcon className="w-5 h-5 text-pink-600" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5" />
                                        )}
                                    </span>
                                </div>
                                {selected === 'carYear' && (
                                    <YearsModal
                                        datas={datas}
                                        setDatas={setDatas}
                                        setSelected={setSelected}
                                    />
                                )}
                            </div>

                            <img
                                alt="divider"
                                width={2}
                                className="hidden lg:block"
                                src="/assets/hori_divider.png"
                            />

                            {/* Variant */}
                            <div className="relative w-full lg:w-auto mb-4 lg:mb-0">
                                <div
                                    className={`p-5 mx-3 bg-gray-100 lg:bg-white lg:rounded-xl ${
                                        selected !== ''
                                            ? 'rounded-t-xl'
                                            : 'rounded-xl'
                                    } cursor-pointer select-none flex justify-between`}
                                    onClick={() =>
                                        showModal('carVariant', 'carYear')
                                    }
                                >
                                    <div className="text-left">
                                        <p>Variant</p>
                                        <p className="font-semibold">
                                            {datas.carVariant?.name}
                                        </p>
                                    </div>
                                    <span className="lg:hidden">
                                        {selected === 'carVariant' ? (
                                            <ChevronDownIcon className="w-5 h-5 text-pink-600" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5" />
                                        )}
                                    </span>
                                </div>
                                {selected === 'carVariant' && (
                                    <VariantsModal
                                        datas={datas}
                                        setDatas={setDatas}
                                        setSelected={setSelected}
                                    />
                                )}
                            </div>

                            <img
                                alt="divider"
                                width={2}
                                className="hidden lg:block"
                                src="/assets/hori_divider.png"
                            />

                            {/* KMs Driven */}
                            <div className="relative w-full lg:w-auto mb-4 lg:mb-0">
                                <div
                                    className={`p-5 mx-3 bg-gray-100 lg:bg-white lg:rounded-xl ${
                                        selected !== ''
                                            ? 'rounded-t-xl'
                                            : 'rounded-xl'
                                    } cursor-pointer select-none flex justify-between`}
                                    onClick={() =>
                                        showModal('carKmDriven', 'carVariant')
                                    }
                                >
                                    <div className="text-left">
                                        <p>Kms Driven</p>
                                        <p className="font-semibold">
                                            {datas.minKilometers &&
                                            datas.maxKilometers
                                                ? `${datas.minKilometers} - ${datas.maxKilometers}`
                                                : datas.minKilometers ||
                                                  datas.maxKilometers ||
                                                  ''}
                                        </p>
                                    </div>
                                    <span className="lg:hidden">
                                        {selected === 'carKmDriven' ? (
                                            <ChevronDownIcon className="w-5 h-5 text-pink-600" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5" />
                                        )}
                                    </span>
                                </div>
                                {selected === 'carKmDriven' && (
                                    <KmsModal
                                        datas={datas}
                                        setDatas={setDatas}
                                        setSelected={setSelected}
                                    />
                                )}
                            </div>

                            <img
                                alt="divider"
                                width={2}
                                className="hidden lg:block"
                                src="/assets/hori_divider.png"
                            />

                            {/* Registration State */}
                            <div className="relative w-full lg:w-auto mb-4 lg:mb-0">
                                <div
                                    className={`p-5 mx-3 bg-gray-100 lg:bg-white lg:rounded-xl ${
                                        selected !== ''
                                            ? 'rounded-t-xl'
                                            : 'rounded-xl'
                                    } cursor-pointer select-none flex justify-between`}
                                    onClick={() =>
                                        showModal('carState', 'carKmDriven')
                                    }
                                >
                                    <div className="text-left">
                                        <p>Reg. State</p>
                                        <p className="font-semibold">
                                            {datas.carState?.label}
                                        </p>
                                    </div>
                                    <span className="lg:hidden">
                                        {selected === 'carState' ? (
                                            <ChevronDownIcon className="w-5 h-5 text-pink-600" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5" />
                                        )}
                                    </span>
                                </div>
                                {selected === 'carState' && (
                                    <StatesModal
                                        datas={datas}
                                        setDatas={setDatas}
                                        setSelected={setSelected}
                                    />
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="w-full lg:w-auto mt-4 lg:mt-0">
                                <button
                                    disabled={
                                        datas.carState === '' || isLoading
                                    }
                                    className="w-full lg:w-[172px] h-12 lg:h-[74px] bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-white font-medium flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleSubmit}
                                >
                                    Submit Car
                                    {isLoading && <SpinnerLoader />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    )
}
