import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Checkbox, Modal } from 'antd'
import useApi from 'lib/hooks/useApi'
import useToast from 'lib/hooks/useToast'
import Button from 'components/input/Button'
import leadApi from 'lib/services/car.services'
import citiesApi from 'lib/services/cities.services'
import TextArea from 'components/input/TextArea'
import DateInput from 'components/input/DateInput'
import FileInput from 'components/input/FileInput'
import TextInput from 'components/input/TextInput'
import { useForm, Controller } from 'react-hook-form'
import SelectInput from 'components/admin/common/Select'
import { errorSetter, extractKilometers, FileImage } from 'lib/utils/helper'
import {
    useListBrands,
    useListFuelTypes,
    useListModels,
    useListTransmissionTypes,
    useListVariants,
} from 'lib/hooks/useCarService'
import moment from 'moment'
import { getYears } from 'lib/utils/getYears'
import { getStates } from 'lib/utils/getStates'
import { getKms } from 'lib/utils/getKms'
import { useQueryClient, useQuery } from 'react-query'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import useApp from 'lib/hooks/useApp'
import commontUtils from 'lib/utils/common.utils'

// Car logos mapping (same as BrandModal)
const POPULAR_CAR_LOGOS = {
    BMW: { img: '/assets/car_logos/bmw-logo.svg' },
    Chevrolet: { img: '/assets/car_logos/chevrolet-logo.svg' },
    Tata: { img: '/assets/car_logos/tata-logo.svg' },
    'Maruti Suzuki': { img: '/assets/car_logos/maruti-logo.svg' },
    Hyundai: { img: '/assets/car_logos/hyundai-logo.svg' },
    Ford: { img: '/assets/car_logos/ford-logo.svg' },
    Mahindra: { img: '/assets/car_logos/mahindra-logo.svg' },
    Honda: { img: '/assets/car_logos/honda-logo.svg' },
    Toyota: { img: '/assets/car_logos/toyota-logo.svg' },
    'Ashok Leyland': { img: '/assets/car_logos/ashok-leyland-logo.svg' },
    'Aston Martin': { img: '/assets/car_logos/aston-martin-logo.svg' },
    Audi: { img: '/assets/car_logos/audi-logo.svg' },
    Austin: { img: '/assets/car_logos/austin-logo.svg' },
    Bentley: { img: '/assets/car_logos/bentley-logo.svg' },
    Bugatti: { img: '/assets/car_logos/bugatti-logo.svg' },
    BYD: { img: '/assets/car_logos/byd-logo.svg' },
    Cadillac: { img: '/assets/car_logos/cadillac-logo.svg' },
}

export default function AddLeadModal({
    mode = 'add',
    details,
    isModalOpen,
    handleModal,
}) {
    // states
    const [loading, setLoading] = useState()
    const [images, setImages] = useState([])
    const [preview, setPreview] = useState([])
    const [carType, setCarType] = useState('pre-owned')
    const [existingImages, setExistingImages] = useState([])
    const [selectedBrandTab, setSelectedBrandTab] = useState('popular')
    const [brandSearch, setBrandSearch] = useState('')
    const [showCustomOwnerCount, setShowCustomOwnerCount] = useState(false)
    const [customOwnerCount, setCustomOwnerCount] = useState('')

    //hooks
    const router = useRouter()
    const { user } = useApp()
    const { success, error } = useToast()
    const queryClient = useQueryClient()

    // use forms initialization
    const {
        reset,
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
            brand: null,
            model: null,
            variant: null,
            name: '',
            notes: '',
            contact: '',
            location: '',
            auction_location: '',
            price: '',
            owner_count: '',
            bank_name: '',
            emd_amount: '',
            reserve_price: '',
            vehicle_number: '',
            inspection_date: '',
        },
    })

    const updatedValues = watch()
    //apis
    const API_createLead = useApi(leadApi.createNewLeadV2)
    const API_updateLead = useApi(leadApi.updateLead)

    // drop data brand - fetch all brands and filter on frontend
    const { data: allBrandList, isLoading: isAllBrandsLoading } = useListBrands(
        {
            type: 'all',
            limit: 100,
        }
    )
    const allBrands = allBrandList?.data || []

    // Filter popular brands on frontend (first 9 brands sorted by popular field)
    const popularBrands = useMemo(() => {
        return allBrands
            .filter(
                (brand) => brand.popular !== undefined && brand.popular !== null
            )
            .sort((a, b) => (a.popular || 0) - (b.popular || 0))
            .slice(0, 9)
    }, [allBrands])

    // Filter brands based on search
    const filteredPopularBrands = useMemo(() => {
        if (!brandSearch) return popularBrands
        const searchRegex = new RegExp(
            commontUtils.convertToRegex(brandSearch),
            'gi'
        )
        const searchLower = brandSearch.toLowerCase().trim()

        return popularBrands
            ?.filter((brand) => brand.name.match(searchRegex))
            .sort((a, b) => {
                const aNameLower = a.name.toLowerCase()
                const bNameLower = b.name.toLowerCase()

                // Check if brand name starts with search term
                const aStarts = aNameLower.startsWith(searchLower)
                const bStarts = bNameLower.startsWith(searchLower)

                // Prioritize brands that start with search term
                if (aStarts && !bStarts) return -1
                if (!aStarts && bStarts) return 1

                // If both start or neither starts, maintain original order
                return 0
            })
    }, [popularBrands, brandSearch])

    const filteredAllBrands = useMemo(() => {
        if (!brandSearch) return allBrands
        const searchRegex = new RegExp(
            commontUtils.convertToRegex(brandSearch),
            'gi'
        )
        const searchLower = brandSearch.toLowerCase().trim()

        return allBrands
            ?.filter((brand) => brand.name.match(searchRegex))
            .sort((a, b) => {
                const aNameLower = a.name.toLowerCase()
                const bNameLower = b.name.toLowerCase()

                // Check if brand name starts with search term
                const aStarts = aNameLower.startsWith(searchLower)
                const bStarts = bNameLower.startsWith(searchLower)

                // Prioritize brands that start with search term
                if (aStarts && !bStarts) return -1
                if (!aStarts && bStarts) return 1

                // If both start or neither starts, maintain original order
                return 0
            })
    }, [allBrands, brandSearch])
    const { data: modelList, isLoading: isModelsLoading } = useListModels(
        {
            make_id: updatedValues?.brand?._id,
        },
        { enabled: Boolean(updatedValues?.brand?._id) },
        updatedValues?.brand?._id
    )

    const models = modelList?.data?.models
    const years = getYears()
    const filterdYears = years?.map((year) => ({
        label: year,
        value: year,
    }))
    const kms = getKms()
    const states = getStates()
    const {
        data: variantList,
        isLoading: isVairantsLoading,
        isFetching,
    } = useListVariants(
        {
            model_id: updatedValues?.model?._id,
        },
        { enabled: Boolean(updatedValues?.model?._id) },
        updatedValues?.model?._id
    )
    const variants = variantList?.data?.variants

    const { data: fuelTypeList, isLoading: isFuelTypeLoading } =
        useListFuelTypes()
    const fuel_types = fuelTypeList?.data

    const { data: transmissionTypeList, isLoading: isTransmissionTypeLoading } =
        useListTransmissionTypes()
    const transmission_types = transmissionTypeList?.data

    const handleCarType = (type) => {
        setCarType(type)
    }

    // onsubmit function
    const onSubmit = () => {
        clearErrors()
        handleSubmit(async (params) => {
            // Check if user is authenticated
            const token = localStorage.getItem('accessToken')
            if (!token) {
                error('You are not authenticated. Please log in again.')
                return
            }

            // Validate required fields before submission
            const requiredFields = [
                'name',
                'contact',
                'vehicle_number',
                'brand',
                'model',
                'variant',
                'year_of_manufacture',
                'state',
                'kms',
            ]
            const missingFields = requiredFields.filter(
                (field) => !params[field]
            )

            if (missingFields.length > 0) {
                // console.warn('⚠️ Missing required fields:', missingFields)
                error(
                    `Please fill in all required fields: ${missingFields.join(
                        ', '
                    )}`
                )
                return
            }

            // If car_type is auction, validate auction details
            if (carType === 'auction') {
                const auctionFields = [
                    'bank_name',
                    'start_date',
                    'end_date',
                    'auction_location',
                    'emd_amount',
                    'emd_date',
                    'reserve_price',
                    'inspection_date',
                ]
                const missingAuctionFields = auctionFields.filter(
                    (field) => !params[field]
                )

                if (missingAuctionFields.length > 0) {
                    // console.warn('⚠️ Missing auction fields:', missingAuctionFields)
                    error(
                        `For auction cars, please fill in: ${missingAuctionFields.join(
                            ', '
                        )}`
                    )
                    return
                }
            }

            setLoading(true)
            const formData = new FormData()

            // Handle KMS - now it's a direct number instead of a range
            const actualKms =
                parseInt(
                    params?.kms ||
                        params?.kms?.value ||
                        details?.vehicle?.kilometers
                ) || null
            const kms = actualKms
                ? { minKilometers: actualKms, maxKilometers: actualKms }
                : { minKilometers: null, maxKilometers: null }

            const existing_images = details?.image_keys.filter(
                (item) => !existingImages.includes(item)
            )

            const payloadData = {
                owner: {
                    name: params?.name,
                    contact: params?.contact,
                },
                vehicle: {
                    number: params?.vehicle_number || details?.vehicle?.number,
                    brand_id: params?.brand?._id || details?.vehicle?.brand_id,
                    model_id: params?.model?._id || details?.vehicle?.model_id,
                    variant_id:
                        params?.variant?._id || details?.vehicle?.variant_id,
                    year_of_manufacture:
                        params?.year_of_manufacture?.label ||
                        details?.vehicle?.year_of_manufacture,
                    registered_state:
                        params?.state?.label ||
                        details?.vehicle?.registered_state,
                    kilometers: params?.kms || details?.vehicle?.kilometers,
                    min_kilometers: kms?.minKilometers,
                    max_kilometers: kms?.maxKilometers,
                    price: params?.price || details?.vehicle?.price,
                    location: params?.location || details?.vehicle?.location,
                    owner_count: (() => {
                        const ownerCountValue =
                            params?.owner_count || details?.vehicle?.owner_count
                        // Handle custom owner count (format: custom_6)
                        if (ownerCountValue?.startsWith('custom_')) {
                            return ownerCountValue.replace('custom_', '')
                        }
                        // If it's "more_than_5" but customOwnerCount is set, use that
                        if (
                            ownerCountValue === 'more_than_5' &&
                            customOwnerCount
                        ) {
                            return customOwnerCount
                        }
                        // Otherwise use the value as is (1, 2, 3, 4, 5)
                        return ownerCountValue
                    })(),
                    notes: params?.notes || details?.vehicle?.notes,
                    image:
                        images?.length > 0
                            ? `${user?.name}'s${params?.vehicle_number}`
                            : details?.vehicle?.image,
                },
                auction_details: {
                    bank_name: params?.bank_name,
                    start_date: params?.start_date,
                    end_date: params?.end_date,
                    location:
                        params?.auction_location?.label ||
                        params?.auction_location,
                    emd_amount: params?.emd_amount,
                    emd_date: params?.emd_date,
                    reserve_price: params?.reserve_price,
                    inspection_date: params?.inspection_date,
                },
                fuel_type_id: params?.fuel_type?.value,
                transmission_type_id: params?.transmission_type?.value,
                car_type: carType || 'pre-owned',
                ...(details && {
                    existingImageKeys: existing_images,
                }),
            }

            formData.append('data', JSON.stringify(payloadData))

            if (images?.length > 0) {
                images.forEach((item) => {
                    formData.append('files', item)
                })
            }

            try {
                const response =
                    mode === 'edit'
                        ? await API_updateLead.request(details?._id, formData)
                        : await API_createLead.request(formData)

                if (response?.isError) {
                    setLoading(false)

                    // Show the actual error message instead of generic "Failed to create"
                    const errorMessage =
                        response?.errors?.[0]?.message ||
                        'Failed to create lead'
                    error(errorMessage)
                    errorSetter(response?.errors, setError)
                } else {
                    reset()
                    setImages([])
                    setPreview(null)
                    setExistingImages([])
                    setShowCustomOwnerCount(false)
                    setCustomOwnerCount('')
                    queryClient.invalidateQueries(['Leads'])
                    router.push('/admin/leads/recently-added')
                    mode === 'edit'
                        ? success('Lead details updated successfully')
                        : success('Lead created successfully')

                    setLoading(false)
                    handleModal()
                }
            } catch (error) {
                setLoading(false)
            }
        })()
    }

    useEffect(() => {
        if (mode === 'edit' && details) {
            setValue('name', details?.owner?.name || '')
            setValue('notes', details?.vehicle?.notes || '')
            setValue('price', details?.vehicle?.price || '')
            setValue('location', details?.vehicle?.location || '')
            // Handle owner count - convert to dropdown format
            const ownerCountValue = details?.vehicle?.owner_count
            if (ownerCountValue) {
                const countNum = parseInt(ownerCountValue)
                if (!isNaN(countNum)) {
                    if (countNum >= 1 && countNum <= 5) {
                        setValue('owner_count', countNum.toString())
                    } else if (countNum > 5) {
                        setValue('owner_count', 'more_than_5')
                        setCustomOwnerCount(countNum.toString())
                        setShowCustomOwnerCount(true)
                    }
                } else {
                    setValue('owner_count', '')
                }
            } else {
                setValue('owner_count', '')
            }
            setValue('brand', {
                _id: details?.brand?._id || '',
                name: details?.brand?.name || '',
            })
            setValue('model', {
                _id: details?.model?._id || '',
                name: details?.model?.name || '',
            })
            setValue('variant', {
                _id: details?.variant?._id || details?.variant?.id || '',
                name: details?.variant?.name || '',
            })
            setValue('contact', details?.owner?.contact || '')
            setValue(
                'emd_date',
                details?.auction_details?.emd_date
                    ? dayjs(details?.auction_details?.emd_date)
                    : null
            )
            setValue(
                'end_date',
                details?.auction_details?.end_date
                    ? dayjs(details?.auction_details?.end_date)
                    : null
            )
            setValue(
                'auction_location',
                details?.auction_details?.location || ''
            )
            setValue('bank_name', details?.auction_details?.bank_name || '')
            setValue('emd_amount', details?.auction_details?.emd_amount || '')
            setValue(
                'start_date',
                details?.auction_details?.start_date
                    ? dayjs(details?.auction_details?.start_date)
                    : null
            )
            setValue(
                'reserve_price',
                details?.auction_details?.reserve_price || ''
            )
            setValue('vehicle_number', details?.vehicle?.number || '')
            setValue(
                'inspection_date',
                details?.auction_details?.inspection_date
                    ? dayjs(details?.auction_details?.inspection_date)
                    : null
            )
            setValue('state', details?.vehicle?.registered_state || '')
            setValue(
                'fuel_type',
                details?.fuel_type
                    ? {
                          value: details?.fuel_type?.id || '',
                          label: details?.fuel_type?.name || '',
                      }
                    : null
            )
            setValue(
                'transmission_type',
                details?.transmission_type
                    ? {
                          value: details?.transmission_type?.id || '',
                          label: details?.transmission_type?.name || '',
                      }
                    : null
            )
            // Set KMS - now it's a direct number, use the actual kilometers value
            setValue(
                'kms',
                String(
                    details?.vehicle?.kilometers ||
                        details?.vehicle?.min_kilometers ||
                        ''
                )
            )
            setValue(
                'year_of_manufacture',
                details?.vehicle?.year_of_manufacture || ''
            )

            setCarType(details?.car_type || 'pre-owned')
        } else if (mode === 'add') {
            reset()
            setImages([])
            setPreview([])
            setExistingImages([])
            setShowCustomOwnerCount(false)
            setCustomOwnerCount('')
            setCarType('pre-owned')
        }
    }, [details, isModalOpen])

    // cities data - using React Query for reliable data fetching
    const {
        data: citiesList,
        isLoading: isCitiesLoading,
        error: citiesError,
    } = useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const response = await citiesApi.listCities()
            return response.data
        },
        // enabled: carType === 'auction',
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    })

    const cities = citiesList?.data || []

    const citiesOptions = useMemo(
        () =>
            cities
                .map((city) => ({
                    label: city.name,
                    _id: city._id,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        [cities]
    )

    useEffect(() => {
        if (mode === 'edit' && details && citiesOptions.length > 0) {
            const matchedCity = citiesOptions.find(
                (city) =>
                    city._id === details?.vehicle?.location ||
                    city.label === details?.vehicle?.location
            )
            setValue('location', matchedCity || '')
        }
        // We still want to do the rest of the value setting for edit mode
        // So keep the existing logic for other fields untouched and not duplicated
    }, [mode, details, citiesOptions])

    const disablePastDates = (current) => {
        return current && current < moment().startOf('day')
    }

    useEffect(() => {
        if (!details) return
        // Prefer signed URLs when available
        if (
            Array.isArray(details?.image_keys_signed_urls) &&
            details.image_keys_signed_urls.length > 0
        ) {
            setPreview(details.image_keys_signed_urls.map((u) => u))
            return
        }
        if (
            Array.isArray(details?.image_keys) &&
            details.image_keys.length > 0
        ) {
            const previewImages = details.image_keys.map((item) =>
                FileImage(item)
            )
            setPreview(previewImages)
        }
    }, [details])
    // const disableFutureYears = (current) => {
    //     return current && current > moment().startOf('year')
    // }
    const handleClose = () => {
        reset()
        setShowCustomOwnerCount(false)
        setCustomOwnerCount('')
        handleModal()
    }

    const isButtonEnabled =
        !updatedValues?.name ||
        !updatedValues?.contact ||
        !updatedValues?.vehicle_number

    const defaultImage =
        details?.image_key === undefined || details?.image_key === ''
            ? '/assets/common/dummy_car.svg'
            : FileImage(details?.image_key)
    // console.log({ defaultImage });

    return (
        <Modal
            centered
            footer={null}
            title={mode === 'add' ? 'Add new lead' : 'Edit lead'}
            open={isModalOpen}
            onCancel={handleClose}
        >
            <div className="w-full my-3 h-[700px] overflow-y-auto">
                <div className="w-full flex flex-wrap">
                    <div className="w-1/2">
                        <span>
                            <Checkbox
                                value="pre-owned"
                                checked={carType === 'pre-owned'}
                                onChange={(e) => handleCarType(e.target.value)}
                            />
                        </span>
                        <label className="pl-4">User-Owned </label>
                    </div>
                    <div className="w-1/2">
                        <span>
                            <Checkbox
                                value="auction"
                                checked={carType === 'auction'}
                                onChange={(e) => handleCarType(e.target.value)}
                            />
                        </span>
                        <label className="pl-4">Bank auction</label>
                    </div>
                    <div className="w-1/2"></div>
                </div>
                <div className="w-full my-3">
                    <span className="underline text-md text-grayLight">
                        Owner details
                    </span>
                </div>
                <div className="w-full">
                    <ul className="w-full list-none flex flex-wrap gap-4 lg:gap-0">
                        <li className="w-full lg:w-1/2">
                            <Controller
                                control={control}
                                rules={{
                                    maxLength: {
                                        value: 50,
                                        message:
                                            'Name cannot exceed 50 characters',
                                    },
                                    pattern: {
                                        value: /^[A-Za-z\s]{1,50}$/,
                                        message:
                                            'Name should only contain letters and spaces, and be between 1 and 50 characters long',
                                    },
                                    validate: (value) => {
                                        if (
                                            !value ||
                                            value.trim().length === 0
                                        ) {
                                            return 'Name is required'
                                        }
                                        if (value.length > 50) {
                                            return 'Name cannot exceed 50 characters'
                                        }
                                        // Check if first letter is capital
                                        const firstChar = value.trim().charAt(0)
                                        if (
                                            firstChar &&
                                            !/^[A-Z]/.test(firstChar)
                                        ) {
                                            return 'Name must start with a capital letter'
                                        }
                                        return true
                                    },
                                }}
                                render={({ field: { onChange, value } }) => {
                                    const handleNameChange = (e) => {
                                        // Only allow letters and spaces
                                        let inputValue = e.target.value.replace(
                                            /[^A-Za-z\s]/g,
                                            ''
                                        )

                                        // Limit to 50 characters
                                        if (inputValue.length > 50) {
                                            inputValue = inputValue.slice(0, 50)
                                        }

                                        // Capitalize first letter
                                        if (inputValue.length > 0) {
                                            const firstChar = inputValue
                                                .charAt(0)
                                                .toUpperCase()
                                            const rest = inputValue.slice(1)
                                            inputValue = firstChar + rest
                                        }

                                        onChange(inputValue)
                                    }

                                    return (
                                        <TextInput
                                            label="Name*"
                                            placeholder="Enter name"
                                            value={value}
                                            error={errors.name}
                                            onChange={handleNameChange}
                                            className="text-input-rounded-none"
                                        />
                                    )
                                }}
                                name="name"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 lg:pl-3">
                            <Controller
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^\+91[6-9]{1}[0-9]{9}$/,
                                        message:
                                            'Please enter a valid 10 digit Indian mobile number (must start with 6, 7, 8, or 9)',
                                    },
                                }}
                                // render={({ field: { onChange, value } }) => (
                                //     <TextInput
                                //         label="Contact*"
                                //         placeholder="Enter contact"
                                //         value={value}
                                //         error={errors.contact}
                                //         onChange={onChange}
                                //         className="text-input-rounded-none"
                                //     />
                                // )}
                                render={({ field: { onChange, value } }) => {
                                    // Ensure value is not undefined
                                    const inputValue = value
                                        ? value.replace(/^\+91/, '')
                                        : '' // Remove +91 for user input

                                    const handleChange = (e) => {
                                        const newValue = e.target.value

                                        // If the input is cleared, reset the value
                                        if (newValue === '') {
                                            onChange('')
                                            return
                                        }

                                        // Check if user is trying to prepend +91
                                        if (newValue.startsWith('+91')) {
                                            // Extract only the numeric part after +91
                                            const numericPart = newValue
                                                .replace(/^\+91/, '')
                                                .replace(/\D/g, '') // Remove all non-numeric characters
                                                .slice(0, 10) // Limit to 10 digits

                                            onChange(
                                                numericPart
                                                    ? `+91${numericPart}`
                                                    : '+91'
                                            )
                                        } else {
                                            // Always prepend +91 if the user inputs something
                                            const numericPart = newValue
                                                .replace(/\D/g, '') // Remove all non-numeric characters
                                                .slice(0, 10) // Limit to 10 digits
                                            onChange(
                                                numericPart
                                                    ? `+91${numericPart}`
                                                    : '+91'
                                            )
                                        }
                                    }

                                    return (
                                        <TextInput
                                            label="Contact*"
                                            placeholder="Enter 10 digit mobile number"
                                            value={`+91${inputValue}`}
                                            error={errors.contact}
                                            onChange={handleChange}
                                            className="text-input-rounded-none"
                                            type="tel"
                                        />
                                    )
                                }}
                                name="contact"
                            />
                        </li>
                    </ul>
                </div>
                <div className="w-full">
                    <span className="underline text-md text-grayLight block mt-4 pb-2">
                        Vehicle information
                    </span>
                </div>

                <div>
                    <FileInput
                        value={images}
                        defaultImage={details ? defaultImage : null}
                        label={'Vehicle image'}
                        postFix={
                            <p className="text-xs font-thin">( Optional )</p>
                        }
                        files={images}
                        setFiles={setImages}
                        preview={preview}
                        setPreview={setPreview}
                        existingImages={existingImages}
                        setExistingImages={setExistingImages}
                        acceptedFiles={['.jpg', '.png', '.jpeg']}
                    />
                </div>
                <div className="w-full">
                    <ul className="list-none flex flex-wrap">
                        <li className="w-full py-2">
                            <Controller
                                control={control}
                                rules={{
                                    maxLength: {
                                        value: 14,
                                        message:
                                            'Vehicle number cannot exceed 14 characters',
                                    },
                                    validate: (value) => {
                                        if (
                                            !value ||
                                            value.trim().length === 0
                                        ) {
                                            return 'Vehicle number is required'
                                        }
                                        if (value.length > 14) {
                                            return 'Vehicle number cannot exceed 14 characters'
                                        }
                                        // Ensure it starts with an alphabet
                                        if (!/^[A-Z]/.test(value)) {
                                            return 'Vehicle number must start with an alphabet'
                                        }
                                        return true
                                    },
                                }}
                                render={({ field: { onChange, value } }) => {
                                    const handleVehicleNumberChange = (e) => {
                                        // Convert to uppercase and remove invalid characters (only allow alphanumeric)
                                        let inputValue = e.target.value
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, '')

                                        // Ensure it starts with an alphabet only
                                        if (
                                            inputValue.length > 0 &&
                                            /^[0-9]/.test(inputValue)
                                        ) {
                                            // If it starts with a number, remove it
                                            inputValue = inputValue.replace(
                                                /^[0-9]+/,
                                                ''
                                            )
                                        }

                                        // Limit to 14 characters
                                        if (inputValue.length > 14) {
                                            inputValue = inputValue.slice(0, 14)
                                        }

                                        onChange(inputValue)
                                    }

                                    return (
                                        <TextInput
                                            label="Vehicle number*"
                                            placeholder="Enter vehicle number (max 14 characters)"
                                            value={value}
                                            error={errors.vehicle_number}
                                            onChange={handleVehicleNumberChange}
                                            className="text-input-rounded-none"
                                        />
                                    )
                                }}
                                name="vehicle_number"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 py-2 flex flex-col">
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => {
                                    // Handler to update brand and clear model/variant
                                    const handleBrandChange = (brand) => {
                                        onChange(brand)
                                        // Clear model and variant when brand changes
                                        setValue('model', null)
                                        setValue('variant', null)
                                        clearErrors('model')
                                        clearErrors('variant')
                                    }

                                    return (
                                        <div>
                                            <p className="text-[#475569] text-[14px] font-normal leading-[23px] mb-2">
                                                Brand*
                                            </p>

                                            {/* Brand Search */}
                                            <div className="flex bg-[#F2F3F5] p-3 items-center rounded-lg mb-3">
                                                <input
                                                    className="focus:outline-none w-full bg-[#F2F3F5]"
                                                    type="text"
                                                    placeholder="Search car brand"
                                                    value={brandSearch}
                                                    onChange={(e) =>
                                                        setBrandSearch(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <img
                                                    src="/assets/search_icon.png"
                                                    alt="search"
                                                    width={16}
                                                    height={16}
                                                />
                                            </div>

                                            {/* Brand Tabs */}
                                            <div className="flex justify-between w-full mb-3">
                                                <div
                                                    className={`${
                                                        selectedBrandTab ===
                                                        'popular'
                                                            ? 'border-b-4 border-secondary text-secondary'
                                                            : 'border-[#ADADAD] text-[#ADADAD]'
                                                    } w-1/2 border-b-4 p-2 cursor-pointer text-center`}
                                                    onClick={() =>
                                                        setSelectedBrandTab(
                                                            'popular'
                                                        )
                                                    }
                                                >
                                                    Popular Brands
                                                </div>
                                                <div
                                                    className={`${
                                                        selectedBrandTab ===
                                                        'all'
                                                            ? 'border-b-4 border-secondary text-secondary'
                                                            : 'border-[#ADADAD] text-[#ADADAD]'
                                                    } w-1/2 border-b-4 p-2 cursor-pointer text-center`}
                                                    onClick={() =>
                                                        setSelectedBrandTab(
                                                            'all'
                                                        )
                                                    }
                                                >
                                                    More Brands
                                                </div>
                                            </div>

                                            {/* Brand Selection */}
                                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                                {selectedBrandTab ===
                                                    'popular' && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {filteredPopularBrands?.map(
                                                            (brand) => (
                                                                <div
                                                                    key={
                                                                        brand._id
                                                                    }
                                                                    className={`h-16 bg-[#F2F3F5] rounded-md flex justify-center items-center cursor-pointer ${
                                                                        value?._id ===
                                                                        brand._id
                                                                            ? 'ring-2 ring-secondary'
                                                                            : ''
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleBrandChange(
                                                                            brand
                                                                        )
                                                                    }
                                                                >
                                                                    <img
                                                                        src={
                                                                            POPULAR_CAR_LOGOS[
                                                                                brand
                                                                                    .name
                                                                            ]
                                                                                ?.img ||
                                                                            '/assets/car_logos/default.svg'
                                                                        }
                                                                        alt={
                                                                            brand.name
                                                                        }
                                                                        className="w-8 h-8 object-contain"
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                                {selectedBrandTab === 'all' && (
                                                    <div className="space-y-2">
                                                        {filteredAllBrands?.map(
                                                            (brand) => (
                                                                <div
                                                                    key={
                                                                        brand._id
                                                                    }
                                                                    className={`h-10 flex w-full bg-[#F2F3F5] rounded-md cursor-pointer ${
                                                                        value?._id ===
                                                                        brand._id
                                                                            ? 'bg-secondary text-white'
                                                                            : ''
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleBrandChange(
                                                                            brand
                                                                        )
                                                                    }
                                                                >
                                                                    <p className="m-auto">
                                                                        {
                                                                            brand.name
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selected Brand Display */}
                                            {value && (
                                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                                    <p className="text-sm text-green-800">
                                                        Selected:{' '}
                                                        <strong>
                                                            {value.name}
                                                        </strong>
                                                    </p>
                                                </div>
                                            )}

                                            {errors.brand && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.brand.message}
                                                </p>
                                            )}
                                        </div>
                                    )
                                }}
                                name="brand"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 lg:pl-3 py-2 flex flex-col">
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SelectInput
                                        label="Model"
                                        placeholder="Select model"
                                        value={value?._id}
                                        error={errors.model}
                                        onChange={(option) => {
                                            const modelObj = {
                                                _id: option?.value,
                                                name: option?.label,
                                            }
                                            onChange(modelObj)
                                            // Clear variant when model changes
                                            setValue('variant', null)
                                            clearErrors('variant')
                                        }}
                                        labelKey="name"
                                        valueKey="_id"
                                        options={models}
                                        className="select-input-rounded-none"
                                        disabled={
                                            !updatedValues?.brand?._id ||
                                            isModelsLoading
                                        }
                                    />
                                )}
                                name="model"
                            />
                        </li>
                        <li className="w-full lg:w-1/2  py-2 flex flex-col">
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SelectInput
                                        value={value?._id}
                                        label="Variant"
                                        placeholder="Select variant"
                                        labelKey="name"
                                        valueKey="_id"
                                        options={variants}
                                        onChange={(option) => {
                                            const variantObj = {
                                                _id: option?.value,
                                                name: option?.label,
                                            }
                                            onChange(variantObj)
                                        }}
                                        className="select-input-rounded-none"
                                        disabled={
                                            !updatedValues?.model?._id ||
                                            isVairantsLoading
                                        }
                                    />
                                )}
                                name="variant"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 lg:pl-3 py-2 flex flex-col">
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SelectInput
                                        label="Year of manufacture"
                                        placeholder="Select year"
                                        value={value}
                                        error={errors.year_of_manufacture}
                                        onChange={onChange}
                                        options={filterdYears}
                                        valueKey="value"
                                        className="select-input-rounded-none"
                                    />
                                )}
                                name="year_of_manufacture"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 py-2 flex flex-col">
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SelectInput
                                        label="Registered state"
                                        placeholder="Select state"
                                        value={value}
                                        error={errors.state}
                                        onChange={onChange}
                                        options={states}
                                        labelKey="label"
                                        valueKey="key"
                                        className="select-input-rounded-none"
                                    />
                                )}
                                name="state"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 lg:pl-3 py-2 flex flex-col">
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SelectInput
                                        label="Fuel type"
                                        placeholder="Select fuel type"
                                        value={value}
                                        error={errors.fuel_type}
                                        onChange={onChange}
                                        options={fuel_types}
                                        labelKey="name"
                                        className="select-input-rounded-none"
                                    />
                                )}
                                name="fuel_type"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 py-2 flex flex-col">
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SelectInput
                                        label="Transmission type"
                                        placeholder="Select type"
                                        value={value}
                                        error={errors.transmission_type}
                                        onChange={onChange}
                                        labelKey="name"
                                        options={transmission_types}
                                        className="select-input-rounded-none"
                                    />
                                )}
                                name="transmission_type"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 lg:pl-3 py-2 flex flex-col">
                            <Controller
                                control={control}
                                rules={{
                                    validate: (value) => {
                                        if (
                                            !value ||
                                            typeof value !== 'string' ||
                                            value.trim().length === 0
                                        ) {
                                            return 'KMS driven is required'
                                        }
                                        const numericValue = parseInt(
                                            value
                                                .toString()
                                                .replace(/[^0-9]/g, '')
                                        )
                                        if (
                                            isNaN(numericValue) ||
                                            numericValue < 0
                                        ) {
                                            return 'Kilometers must be a valid positive number'
                                        }
                                        if (numericValue > 999999) {
                                            return 'Kilometers cannot exceed 9,99,999'
                                        }
                                        return true
                                    },
                                }}
                                render={({ field: { onChange, value } }) => {
                                    const formatIndianNumber = (num) => {
                                        if (!num) return ''
                                        const numStr = num
                                            .toString()
                                            .replace(/[^0-9]/g, '')

                                        // Indian numbering system: groups of 2 after the first 3 digits
                                        // Pattern: first 3 from right, then pairs of 2
                                        let formatted = ''
                                        const len = numStr.length

                                        if (len <= 3) {
                                            return numStr
                                        }

                                        // Add first 3 digits
                                        if (len > 3) {
                                            formatted = numStr.slice(-3)
                                        }

                                        // Process remaining digits in pairs of 2
                                        let remaining = numStr.slice(0, -3)
                                        while (remaining.length > 0) {
                                            const group =
                                                remaining.slice(-2) || remaining
                                            formatted = group + ',' + formatted
                                            remaining = remaining.slice(0, -2)
                                        }

                                        return formatted
                                    }

                                    const handleKmsChange = (e) => {
                                        // Only allow numeric input
                                        const inputValue =
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                ''
                                            )

                                        // Limit to 6 digits (999999)
                                        const limitedValue = inputValue.slice(
                                            0,
                                            6
                                        )
                                        onChange(limitedValue)
                                    }

                                    return (
                                        <TextInput
                                            label="KMS driven"
                                            placeholder="Enter actual kilometers driven (e.g., 15,345)"
                                            value={formatIndianNumber(value)}
                                            error={errors.kms}
                                            onChange={handleKmsChange}
                                            className="text-input-rounded-none"
                                        />
                                    )
                                }}
                                name="kms"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 py-2 flex flex-col">
                            <Controller
                                control={control}
                                rules={{
                                    validate: (value) => {
                                        if (
                                            !value ||
                                            String(value).trim().length === 0
                                        ) {
                                            return 'Price is required'
                                        }
                                        const numericValue = parseInt(
                                            value
                                                .toString()
                                                .replace(/[^0-9]/g, '')
                                        )
                                        if (isNaN(numericValue)) {
                                            return 'Price should be a valid number'
                                        }
                                        if (numericValue < 15000) {
                                            return 'Price should be at least ₹15,000'
                                        }
                                        if (numericValue > 99999999) {
                                            return 'Price cannot exceed ₹9,99,99,999'
                                        }
                                        return true
                                    },
                                }}
                                render={({ field: { onChange, value } }) => {
                                    const formatIndianNumber = (num) => {
                                        if (!num) return ''
                                        const numStr = num
                                            .toString()
                                            .replace(/[^0-9]/g, '')

                                        // Indian numbering system: groups of 2 after the first 3 digits
                                        // Pattern: first 3 from right, then pairs of 2
                                        let formatted = ''
                                        const len = numStr.length

                                        if (len <= 3) {
                                            return numStr
                                        }

                                        // Add first 3 digits
                                        if (len > 3) {
                                            formatted = numStr.slice(-3)
                                        }

                                        // Process remaining digits in pairs of 2
                                        let remaining = numStr.slice(0, -3)
                                        while (remaining.length > 0) {
                                            const group =
                                                remaining.slice(-2) || remaining
                                            formatted = group + ',' + formatted
                                            remaining = remaining.slice(0, -2)
                                        }

                                        return formatted
                                    }

                                    const handlePriceChange = (e) => {
                                        // Only allow numeric input
                                        const inputValue =
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                ''
                                            )

                                        // Limit to 8 digits (99999999)
                                        const limitedValue = inputValue.slice(
                                            0,
                                            8
                                        )
                                        onChange(limitedValue)
                                    }

                                    return (
                                        <TextInput
                                            label="Price"
                                            placeholder="Enter price (minimum ₹15,000)"
                                            value={formatIndianNumber(value)}
                                            error={errors.price}
                                            onChange={handlePriceChange}
                                            className="text-input-rounded-none"
                                        />
                                    )
                                }}
                                name="price"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 lg:pl-3 py-2 flex flex-col">
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SelectInput
                                        label="Location"
                                        placeholder="Search city"
                                        value={value?._id}
                                        error={errors.location}
                                        onChange={(option) =>
                                            onChange({
                                                _id: option?.value,
                                                label: option?.label,
                                            })
                                        }
                                        options={citiesOptions}
                                        labelKey="label"
                                        valueKey="_id"
                                        className="select-input-rounded-none"
                                        disabled={isCitiesLoading}
                                    />
                                )}
                                name="location"
                            />
                        </li>
                        <li className="w-full lg:w-1/2 py-2 flex flex-col">
                            <Controller
                                control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message: 'Owner count is required',
                                    },
                                    validate: (value) => {
                                        if (
                                            value === 'more_than_5' &&
                                            !customOwnerCount
                                        ) {
                                            return 'Please enter the owner count'
                                        }
                                        if (
                                            value === 'more_than_5' &&
                                            customOwnerCount
                                        ) {
                                            const num =
                                                parseInt(customOwnerCount)
                                            if (isNaN(num) || num < 6) {
                                                return 'Owner count must be 6 or greater'
                                            }
                                            if (num > 9) {
                                                return 'Owner count cannot exceed 9'
                                            }
                                        }
                                        return true
                                    },
                                }}
                                render={({ field: { onChange, value } }) => {
                                    const ownerCountOptions = [
                                        { label: '1st Owner', value: '1' },
                                        { label: '2nd Owner', value: '2' },
                                        { label: '3rd Owner', value: '3' },
                                        { label: '4th Owner', value: '4' },
                                        { label: '5th Owner', value: '5' },
                                        {
                                            label: 'More than 5 Owner',
                                            value: 'more_than_5',
                                        },
                                    ]

                                    const handleOwnerCountChange = (option) => {
                                        const selectedValue = option?.value
                                        onChange(selectedValue)
                                        if (selectedValue === 'more_than_5') {
                                            setShowCustomOwnerCount(true)
                                        } else {
                                            setShowCustomOwnerCount(false)
                                            setCustomOwnerCount('')
                                        }
                                    }

                                    const handleCustomOwnerCountChange = (
                                        e
                                    ) => {
                                        // Only allow numeric input
                                        let inputValue = e.target.value.replace(
                                            /[^0-9]/g,
                                            ''
                                        )

                                        // Only allow numbers greater than 5
                                        if (inputValue) {
                                            const num = parseInt(inputValue)
                                            if (!isNaN(num)) {
                                                // Block any value that is 5 or less
                                                // This prevents typing "0", "1", "2", "3", "4", "5" or multi-digit like "05"
                                                // Users can type numbers from 6 to 9 (values exceeding 9 will be capped at 9)
                                                if (num <= 5) {
                                                    return
                                                }
                                                // Limit to maximum 9
                                                if (num > 9) {
                                                    inputValue = '9'
                                                }
                                            }
                                        }

                                        setCustomOwnerCount(inputValue)
                                        // Update the form value with the custom count
                                        if (inputValue) {
                                            onChange(`custom_${inputValue}`)
                                        } else {
                                            // If input is cleared, set back to "more_than_5"
                                            onChange('more_than_5')
                                        }
                                    }

                                    return (
                                        <div>
                                            <SelectInput
                                                label="Owner count"
                                                placeholder="Select owner count"
                                                value={
                                                    value &&
                                                    !value.startsWith('custom_')
                                                        ? value
                                                        : value?.startsWith(
                                                              'custom_'
                                                          )
                                                        ? 'more_than_5'
                                                        : null
                                                }
                                                error={errors.owner_count}
                                                onChange={
                                                    handleOwnerCountChange
                                                }
                                                options={ownerCountOptions}
                                                labelKey="label"
                                                valueKey="value"
                                                disabledSearch={true}
                                                className="select-input-rounded-none"
                                            />
                                            {showCustomOwnerCount && (
                                                <div className="mt-3">
                                                    <TextInput
                                                        label="Enter owner count"
                                                        placeholder="Enter number (6 to 9)"
                                                        value={customOwnerCount}
                                                        error={
                                                            errors.owner_count
                                                        }
                                                        onChange={
                                                            handleCustomOwnerCountChange
                                                        }
                                                        className="text-input-rounded-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                }}
                                name="owner_count"
                            />
                        </li>
                    </ul>
                </div>

                {carType === 'auction' && (
                    <>
                        <div className="w-full">
                            <span className="underline block mt-4 pb-2 text-md text-grayLight">
                                Auction information
                            </span>
                        </div>
                        <div className="w-full">
                            <ul className="list-none flex flex-wrap">
                                <li className="w-full py-2">
                                    <Controller
                                        control={control}
                                        rules={{
                                            pattern: {
                                                value: /^[A-Za-z\s]{1,50}$/,
                                                message:
                                                    'Bank name should only contain letters and spaces, and be between 1 and 50 characters long',
                                            },
                                        }}
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <TextInput
                                                label="Bank name"
                                                placeholder="Enter bank name"
                                                value={value}
                                                error={errors.bank_name}
                                                onChange={onChange}
                                                className="text-input-rounded-none"
                                            />
                                        )}
                                        name="bank_name"
                                    />
                                </li>

                                <li className="w-full lg:w-1/2 py-2 flex flex-col">
                                    <Controller
                                        control={control}
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <DateInput
                                                label="Auction start date & time"
                                                placeholder="Date and time"
                                                value={value}
                                                disabledDate={disablePastDates}
                                                error={errors.start_date}
                                                onChange={onChange}
                                                className="text-input-rounded-none"
                                            />
                                        )}
                                        name="start_date"
                                    />
                                </li>

                                <li className="w-full lg:w-1/2 py-2 lg:pl-3  flex flex-col">
                                    <Controller
                                        control={control}
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <DateInput
                                                label="Auction end date & time"
                                                placeholder="Date and time"
                                                value={value}
                                                disabledDate={(current) => {
                                                    current &&
                                                        current <
                                                            updatedValues?.start_date
                                                }}
                                                minDate={
                                                    updatedValues?.start_date
                                                }
                                                error={errors.end_date}
                                                onChange={onChange}
                                                className="text-input-rounded-none"
                                            />
                                        )}
                                        name="end_date"
                                    />
                                </li>

                                <li className="w-full py-2">
                                    <Controller
                                        control={control}
                                        rules={{
                                            pattern: {
                                                value: /^[A-Za-z0-9\s,.-]{1,50}$/,
                                                message:
                                                    'Location should only contain letters, numbers, spaces, commas, periods, hyphens, and be between 1 and 50 characters long',
                                            },
                                        }}
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <SelectInput
                                                label="Auction location"
                                                placeholder="Search city"
                                                value={value?._id}
                                                error={errors.auction_location}
                                                onChange={(option) =>
                                                    onChange({
                                                        _id: option?.value,
                                                        label: option?.label,
                                                    })
                                                }
                                                options={citiesOptions}
                                                labelKey="label"
                                                valueKey="_id"
                                                className="select-input-rounded-none"
                                                disabled={isCitiesLoading}
                                            />
                                        )}
                                        name="auction_location"
                                    />
                                </li>

                                <li className="w-full lg:w-1/2 py-2 flex flex-col">
                                    <Controller
                                        control={control}
                                        rules={{
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message:
                                                    'Emd amount should only contain numbers',
                                            },
                                            maxLength: {
                                                value: 12,
                                                message:
                                                    'Length must be less than 12',
                                            },
                                        }}
                                        render={({
                                            field: { onChange, value },
                                        }) => {
                                            const handleEmdChange = (e) => {
                                                const numeric = e.target.value
                                                    .replace(/[^0-9]/g, '')
                                                    .slice(0, 12)
                                                onChange(numeric)
                                            }

                                            return (
                                                <TextInput
                                                    label="EMD amount"
                                                    placeholder="Enter EMD amount"
                                                    value={value}
                                                    error={errors.emd_amount}
                                                    onChange={handleEmdChange}
                                                    inputMode="numeric"
                                                    onWheel={(e) =>
                                                        e.currentTarget.blur()
                                                    }
                                                    className="text-input-rounded-none"
                                                />
                                            )
                                        }}
                                        name="emd_amount"
                                    />
                                </li>

                                <li className="w-full lg:w-1/2 py-2 lg:pl-3  flex flex-col">
                                    <Controller
                                        control={control}
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <DateInput
                                                label="EMD date and time"
                                                placeholder="Date and time"
                                                value={value}
                                                error={errors.emd_date}
                                                onChange={onChange}
                                                className="text-input-rounded-none"
                                            />
                                        )}
                                        name="emd_date"
                                    />
                                </li>

                                <li className="w-full lg:w-1/2 py-2 flex flex-col">
                                    <Controller
                                        control={control}
                                        rules={{
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message:
                                                    'Price should only contain numbers',
                                            },
                                            maxLength: {
                                                value: 12,
                                                message:
                                                    'Length must be less than 12',
                                            },
                                        }}
                                        render={({
                                            field: { onChange, value },
                                        }) => {
                                            const handleReservePriceChange = (
                                                e
                                            ) => {
                                                const numeric = e.target.value
                                                    .replace(/[^0-9]/g, '')
                                                    .slice(0, 12)
                                                onChange(numeric)
                                            }

                                            return (
                                                <TextInput
                                                    label="Reserve price"
                                                    placeholder="Enter reserve price"
                                                    value={value}
                                                    error={errors.reserve_price}
                                                    onChange={
                                                        handleReservePriceChange
                                                    }
                                                    inputMode="numeric"
                                                    onWheel={(e) =>
                                                        e.currentTarget.blur()
                                                    }
                                                    className="text-input-rounded-none"
                                                />
                                            )
                                        }}
                                        name="reserve_price"
                                    />
                                </li>

                                <li className="w-full lg:w-1/2 py-2 lg:pl-3  flex flex-col">
                                    <Controller
                                        control={control}
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <DateInput
                                                label="Inspection date"
                                                placeholder="Date"
                                                value={value}
                                                format="DD/MM/YYYY"
                                                onChange={onChange}
                                                showTime={false}
                                                disabledDate={disablePastDates}
                                                error={errors.inspection_date}
                                                className="text-input-rounded-none"
                                            />
                                        )}
                                        name="inspection_date"
                                    />
                                </li>

                                <li className="w-full py-2 flex flex-col"></li>
                            </ul>
                        </div>
                    </>
                )}
                <Controller
                    control={control}
                    rules={{
                        maxLength: {
                            value: 1200,
                            message:
                                'Maxium length of notes is 1200 characters.',
                        },
                    }}
                    render={({ field: { onChange, value } }) => (
                        <TextArea
                            label="Notes"
                            placeholder="Notes here..."
                            value={value}
                            error={errors.notes}
                            onChange={onChange}
                            className="text-input-rounded-none"
                        />
                    )}
                    name="notes"
                />
                <div className="w-full flex justify-end mb-4 mt-6 gap-4">
                    <Button
                        loading={loading}
                        onClick={onSubmit}
                        disabled={API_createLead.loading || isButtonEnabled}
                        className="border-xs-button btn-gradient"
                    >
                        {mode === 'add' ? 'Add new lead' : 'Edit lead'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
