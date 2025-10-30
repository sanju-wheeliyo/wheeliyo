import React, { useEffect, useState } from 'react'
import { Modal } from 'antd'
import useApi from 'lib/hooks/useApi'
import useToast from 'lib/hooks/useToast'
import Button from 'components/input/Button'
import cityApi from 'lib/services/cities.services'
import TextInput from 'components/input/TextInput'
import { useForm, Controller } from 'react-hook-form'
import { errorSetter } from 'lib/utils/helper'
import { useQueryClient } from 'react-query'

export default function CityModal({
    mode = 'add',
    details,
    isModalOpen,
    handleModal,
}) {
    // states
    const [loading, setLoading] = useState()

    //hooks
    const { success, error } = useToast()
    const queryClient = useQueryClient()

    // use forms initialization
    const {
        reset,
        watch,
        control,
        setError,
        setValue,
        clearErrors,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
        },
    })

    const updatedValues = watch()
    //apis
    const API_createCity = useApi(cityApi.postACity)
    const API_updateCity = useApi(cityApi.updateACity)

    // onsubmit function
    const onSubmit = async () => {
        clearErrors()
        handleSubmit(async (params) => {
            setLoading(true)
            const payload = {
                name: params?.name,
            }

            const editPayload = {
                id: details?._id,
                name: params?.name,
            }

            try {
                const response =
                    mode === 'edit'
                        ? await API_updateCity.request(editPayload)
                        : await API_createCity.request(payload)

                if (response?.isError) {
                    setLoading(false)
                    error('Failed to create')
                    errorSetter(response?.errors, setError)
                } else {
                    reset()

                    queryClient.invalidateQueries(['Cities'])

                    if (mode === 'edit') {
                        success('Changes updated successfully')
                    } else {
                        success('New city created successfully')
                    }
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
            setValue('name', details?.name || '')
        }
    }, [details, isModalOpen, reset])

    const handleClose = () => {
        reset()
        handleModal()
    }

    const isButtonEnabled = !updatedValues?.name

    return (
        <Modal
            centered
            footer={null}
            title={mode === 'add' ? 'Add new city' : 'Edit city'}
            open={isModalOpen}
            onCancel={handleClose}
        >
            <div className="w-full mt-3 h-fit overflow-y-auto">
                <div className="w-full">
                    <ul className="w-full list-none flex flex-wrap gap-4 lg:gap-0">
                        <li className="w-full ">
                            <Controller
                                control={control}
                                rules={{
                                    pattern: {
                                        value: /^[A-Za-z\s]{1,50}$/,
                                        message:
                                            'Name should only contain letters and spaces, and be between 1 and 50 characters long',
                                    },
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        label="City*"
                                        placeholder="Enter city"
                                        value={value}
                                        error={errors.name}
                                        onChange={onChange}
                                        className="text-input-rounded-none"
                                    />
                                )}
                                name="name"
                            />
                        </li>
                    </ul>
                </div>

                <div className="w-full flex justify-end mb-4 mt-10 gap-4">
                    <Button
                        loading={loading}
                        onClick={onSubmit}
                        disabled={
                            API_createCity.loading ||
                            API_updateCity.loading ||
                            isButtonEnabled
                        }
                        className="border-xs-button btn-gradient"
                    >
                        {mode === 'add' ? 'Add new city' : 'Edit city'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
