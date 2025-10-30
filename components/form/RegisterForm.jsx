import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import BasicInfoModal from 'components/modals/BasicInfoModal'
import BrandModal from 'components/modals/BrandModal'
import ModelsModal from 'components/modals/ModelsModal'
import YearsModal from 'components/modals/YearsModal'
import VariantsModal from 'components/modals/VariantsModal'
import KmsModal from 'components/modals/KmsModal'
import StatesModal from 'components/modals/StatesModal'
import SpinnerLoader from 'components/loaders/SpinnerLoader'
import carServices from 'lib/services/car.services'
import { useRouter } from 'next/router'
import useApi from 'lib/hooks/useApi'
import { toast } from 'react-toastify'

const RegisterForm = () => {
    const modalRef = useRef(null)
    const router = useRouter()

    const API_getPrice = useApi(carServices.getPrice)

    // const handleClickOutside = (e) => {
    //     console.log('====================================')
    //     console.log(modalRef.current.contains(e.target))
    //     if (modalRef.current && !modalRef.current.contains(e.target)) {
    //         // setSelected('')
    //     }
    // }

    // useEffect(() => {
    //     window.addEventListener('click', handleClickOutside)
    //     return () => window.removeEventListener('click', handleClickOutside)
    // }, [])

    const [datas, setDatas] = useState({
        name: '',
        email: '',
        mobile: '+91',
        sendUpdatesOnWhatsapp: false,
        carNumber: '',
        carBrand: '',
        carYear: '',
        carModel: '',
        carVariant: '',
        carState: '',
        minKilometers: '',
        maxKilometers: '',
    })
    const [errors, setErrors] = useState({
        name: '',
        mobile: '',
    })

    const [selected, setSelected] = useState('')
    // const [isSuccess, setIsSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const clearData = () => {
        setDatas({
            name: '',
            email: '',
            mobile: '',
            sendUpdatesOnWhatsapp: false,
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
        console.log(item)

        setErrors({ name: '', mobile: '' })
        if (item === 'carBrand' && datas.name === '') {
            console.log(item)

            toast(
                'Error: Complete Basic Info first, then proceed to select Brand. You cannot skip steps or fill them out of order.',
                {
                    type: 'error',
                }
            )
        }
        if (selected === item) return setSelected('')
        if (prevItem === 'mobile') {
            if (datas.name === '')
                return setErrors({ ...errors, name: 'Name is required' })
            if (datas.mobile.length !== 13)
                return setErrors({ ...errors, mobile: 'Invalid mobile number' })
        }

        if (datas[prevItem] !== '') setSelected(item)
        else
            toast(
                'Error: This is a one-way form. Please complete each step in order. For example complete Basic Info first, then proceed to select Brand. You cannot skip steps or fill them out of order.',
                {
                    type: 'error',
                }
            )
    }
    const handleSubmit = async () => {
        setSelected('')
        setIsLoading(true)
        const submitData = {
            // name: datas?.name,
            // // email: datas?.email,
            // mobile: datas?.mobile,
            // sendUpdatesOnWhatsapp: datas?.sendUpdatesOnWhatsapp ? 'Yes' : 'No',
            // // carNumber: datas?.carNumber,
            // carBrand: datas?.carBrand?.name,
            // carYear: datas?.carYear,
            // carModel: datas?.carModel?.name,
            // carVariant: datas?.carVariant?.name,
            // carState: datas?.carState?.key,
            // carKmDriven: datas?.carKmDriven?.key,
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
        console.log('====================================')
        console.log(submitData)
        console.log('====================================')
        try {
            const response = await API_getPrice.request(submitData)
            console.log('====================================')
            console.log(response)
            console.log('====================================')
            if (response?.data?.status === 200) {
                setIsLoading(false)
                router.push('/success')
                clearData()
            }
            console.log(response)
        } catch (error) {
            console.log(error)
            setIsLoading(false)
        }

        // handleSubmitToDriveExcel(submitData)
    }

    // const handleSubmitToDriveExcel = async (body) => {
    //     try {
    //         const formData = new FormData()
    //         formData.append('Name', body['name'])
    //         formData.append('Mobile', body['mobile'])
    //         formData.append(
    //             'Send updates on whatsapp',
    //             body['sendUpdatesOnWhatsapp']
    //         )
    //         formData.append('Car Brand', body['carBrand'])
    //         formData.append('Car Year', body['carYear'])
    //         formData.append('Car Model', body['carModel'])
    //         formData.append('Car Variant', body['carVariant'])
    //         formData.append('Car State', body['carState'])
    //         formData.append('Total KM Driven', body['carKmDriven'])

    //         await axios.post(process.env.NEXT_PUBLIC_GOOGLE_FORM_URL, formData)
    //         setIsLoading(false)
    //         // setIsSuccess(true)
    //         clearData()
    //         router.push('/success')
    //     } catch (e) {
    //         console.log('Error in form submitting: ', e)
    //         setIsLoading(false)
    //     }
    // }

    useEffect(() => {
        window.addEventListener('scroll', () => {
            if (!modalRef.current) return
            const rect = modalRef.current.getBoundingClientRect()
            if (rect.y <= 65) {
                modalRef.current.firstChild.style.width = '100%'
            } else {
                modalRef.current.firstChild.style.width = ''
            }
        })
    }, [])
    return (
        <>
            <div
                className="md:block h-[1px] absolute xl:-mt-44 -mt-28"
                id="sell-used-cars"
            ></div>
            <div
                className={`xl:flex w-full justify-center items-center ${selected !== '' ? 'xl:mb-[400px]' : ''
                    }`}
                ref={modalRef}
                id="demo"
            >
                <div className="xl:absolute relative h-full xl:min-w-[85vw] xl:h-[124px] md:bottom-0 xl:translate-y-1/2 xl:bg-white bg-[#f5f5f5] xl:shadow-lg 0  xl:rounded-lg transition-all">
                    <div className="xl:flex text-center py-10 justify-center xl:justify-around items-center h-full text-gray">
                        <div className="relative">
                            <h1 className="text-left pl-4 uppercase text-secondary text-base font-bold xl:hidden mb-4">
                                Sell Your Car
                            </h1>
                            <div
                                className={`p-5 mt-2  mx-3 xl:mt-3 bg-gray-medium xl:bg-white xl:rounded-xl ${selected !== ''
                                    ? 'rounded-t-xl'
                                    : 'rounded-xl'
                                    }  cursor-pointer select-none lg:bg-none flex justify-between`}
                                onClick={() => showModal('mobile')}
                            >
                                <div className="text-left">
                                    <p>Basic info.</p>
                                    <p className="font-semibold w-full max-w-[280px] truncate">
                                        {datas.name}
                                        {datas.name !== '' &&
                                            datas.mobile !== '' &&
                                            ', '}
                                        {datas.name && datas.mobile}
                                    </p>
                                </div>
                                <span className="xl:hidden">
                                    {selected === 'mobile' ? (
                                        <ChevronDownIcon className="w-5 h-5 text-secondary" />
                                    ) : (
                                        <ChevronRightIcon className="w-5 h-5" />
                                    )}
                                </span>
                            </div>
                            {selected === 'mobile' && (
                                <BasicInfoModal
                                    setErrors={setErrors}
                                    errors={errors}
                                    datas={datas}
                                    setDatas={setDatas}
                                    setSelected={setSelected}
                                />
                            )}
                        </div>
                        <img
                            alt="divider"
                            width={2}
                            // height={200}
                            className="hidden xl:block"
                            src="/assets/hori_divider.png"
                        />
                        <div className="relative">
                            <div
                                className={`p-5 mt-2  mx-3 xl:mt-3 bg-gray-medium xl:bg-white xl:rounded-xl  ${selected !== ''
                                    ? 'rounded-t-xl'
                                    : 'rounded-xl'
                                    }  cursor-pointer select-none lg:bg-none flex justify-between `}
                                onClick={() => showModal('carBrand', 'mobile')}
                            >
                                <div className="text-left">
                                    <p>Brand</p>
                                    <p className="font-semibold">
                                        {datas.carBrand?.name}
                                    </p>
                                </div>
                                <span className="xl:hidden">
                                    {selected === 'carBrand' ? (
                                        <ChevronDownIcon className="w-5 h-5 text-secondary" />
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
                            // height={200}
                            className="hidden xl:block"
                            src="/assets/hori_divider.png"
                        />
                        <div className="relative">
                            <div
                                className={`p-5 mt-2  mx-3 xl:mt-3 bg-gray-medium xl:bg-white xl:rounded-xl  ${selected !== ''
                                    ? 'rounded-t-xl'
                                    : 'rounded-xl'
                                    }  cursor-pointer select-none lg:bg-none flex justify-between `}
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
                                <span className="xl:hidden">
                                    {selected === 'carModel' ? (
                                        <ChevronDownIcon className="w-5 h-5 text-secondary" />
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
                            // height={200}
                            className="hidden xl:block"
                            src="/assets/hori_divider.png"
                        />
                        <div className="relative">
                            <div
                                className={`p-5 mt-2  mx-3 xl:mt-3 bg-gray-medium xl:bg-white xl:rounded-xl  ${selected !== ''
                                    ? 'rounded-t-xl'
                                    : 'rounded-xl'
                                    }  cursor-pointer select-none lg:bg-none flex justify-between `}
                                onClick={() => showModal('carYear', 'carModel')}
                            >
                                <div className="text-left">
                                    <p>Year</p>
                                    <p className="font-semibold">
                                        {datas.carYear}
                                    </p>
                                </div>
                                <span className="xl:hidden">
                                    {selected === 'carYear' ? (
                                        <ChevronDownIcon className="w-5 h-5 text-secondary" />
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
                            // height={200}
                            className="hidden xl:block"
                            src="/assets/hori_divider.png"
                        />
                        <div className="relative">
                            <div
                                className={`p-5 mt-2  mx-3 xl:mt-3 bg-gray-medium xl:bg-white xl:rounded-xl  ${selected !== ''
                                    ? 'rounded-t-xl'
                                    : 'rounded-xl'
                                    }  cursor-pointer select-none lg:bg-none flex justify-between `}
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
                                <span className="xl:hidden">
                                    {selected === 'carVariant' ? (
                                        <ChevronDownIcon className="w-5 h-5 text-secondary" />
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
                            // height={200}
                            className="hidden xl:block"
                            src="/assets/hori_divider.png"
                        />
                        <div className="relative">
                            <div
                                className={`p-5 mt-2  mx-3 xl:mt-3 bg-gray-medium xl:bg-white xl:rounded-xl  ${selected !== ''
                                    ? 'rounded-t-xl'
                                    : 'rounded-xl'
                                    }  cursor-pointer select-none lg:bg-none flex justify-between `}
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
                                <span className="xl:hidden">
                                    {selected === 'carKmDriven' ? (
                                        <ChevronDownIcon className="w-5 h-5 text-secondary" />
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
                            // height={200}
                            className="hidden xl:block"
                            src="/assets/hori_divider.png"
                        />
                        <div className="relative">
                            <div
                                className={`p-5 mt-2  mx-3 xl:mt-3 bg-gray-medium xl:bg-white xl:rounded-xl  ${selected !== ''
                                    ? 'rounded-t-xl'
                                    : 'rounded-xl'
                                    }  cursor-pointer select-none lg:bg-none flex justify-between `}
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
                                <span className="xl:hidden">
                                    {selected === 'carState' ? (
                                        <ChevronDownIcon className="w-5 h-5 text-secondary" />
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
                        <p>
                            <button
                                disabled={datas.carState === '' || isLoading}
                                className="w-[90vw] mx-auto h-10 xl:w-[172px] xl:h-[74px] bg-primary-dark rounded-xl  xl:mr-4 my-auto text-white linear-gradient-button mt-4 xl:mt-0 flex justify-center items-center"
                                onClick={handleSubmit}
                            >
                                Get Car Price
                                {isLoading && <SpinnerLoader />}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            {/* {isSuccess && (
                <SuccessModal
                    setIsSuccess={setIsSuccess}
                    isSuccess={isSuccess}
                />
            )} */}
        </>
    )
}

export default RegisterForm
