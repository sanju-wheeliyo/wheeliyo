import Image from 'next/image'
import { useState } from 'react'

const BasicInfoModal = ({ datas, setDatas, errors, setErrors }) => {
    const [isValidMobile, setIsValidMobile] = useState(false)

    const handleChange = (e) => {
        const isChecked = e.target.checked

        if (isChecked)
            return setDatas({ ...datas, sendUpdatesOnWhatsapp: true })

        return setDatas({ ...datas, sendUpdatesOnWhatsapp: false })
    }

    const handleMobileNumber = (e) => {
        let { value } = e.target
        if (value === '') {
            setDatas({ ...datas, mobile: '' })
            setErrors({ ...errors, mobile: 'Mobile number is required' })
            setIsValidMobile(false)
            return
        }
        value = value.replace(/[^\d+]/g, '')

        if (value.includes('+')) {
            value = '+' + value.replace(/\+/g, '')
        }
        setDatas({ ...datas, mobile: value })

        const mobileMatch = value.match(/^\+[1-9]{1}[0-9]{11}$/)

        if (!mobileMatch) {
            setIsValidMobile(false)
            setErrors({
                ...errors,
                mobile: 'Contact number should start with a + followed by the country code and a valid phone number',
            })
        } else {
            setIsValidMobile(true)
            setErrors({ ...errors, mobile: '' })
        }
    }

    const handleNameChange = (e) => {
        let notNameMatch = e.target.value.match(/[^a-zA-Z\s]/g)
        if (notNameMatch) return
        setDatas({ ...datas, name: e.target.value })
        setErrors({ ...errors, name: '' })
    }

    return (
        <div className="h-[370px] mx-3 xl:w-96  bg-gray-medium  xl:bg-gray-light  xl:shadow-xl xl:absolute z-30 top-32 rounded-b-2xl xl:rounded-2xl left-0 flex flex-col  justify-center gap-3 mb-3 modal">
            <h1 className="text-gray-dark pl-3 text-left">Full name</h1>
            <div className="flex mx-[14px] p-3 bg-[#f2f3f5] gap-3 border rounded-md items-center">
                <input
                    type="text"
                    value={datas?.name}
                    className="focus:outline-none w-full bg-[#f2f3f5]"
                    placeholder="Enter full name"
                    onChange={handleNameChange}
                />
            </div>
            <div className="text-red-500 text-left pl-4 text-sm">
                {errors.name}
            </div>
            <h1 className="text-gray-dark pl-3 text-left">Mobile number</h1>
            <div className="flex mx-[14px] p-3 bg-[#f2f3f5] gap-3 border rounded-md items-center">
                <input
                    type="text"
                    value={datas?.mobile}
                    className="focus:outline-none w-full bg-[#f2f3f5]"
                    placeholder="Enter mobile number"
                    onChange={(e) => handleMobileNumber(e)}
                    maxLength="13"
                />
                {isValidMobile && (
                    <img
                        className=""
                        alt="verified"
                        src={'/assets/verified.png'}
                        width={29}
                        height={29}
                    />
                )}
            </div>
            <div className="text-red-500 text-left pl-4 text-sm">
                {errors.mobile}
            </div>
            <p className="text-center text-xs">
                You personal information is secure with us
            </p>
            <div className="flex mx-[14px]">
                <input
                    type="checkbox"
                    className="w-6 h-6 mr-5 cursor-pointer border border-secondary accent-secondary"
                    onChange={(e) => handleChange(e)}
                />
                <span className="text-base text-gray-dark font-semibold flex items-center gap-1">
                    Send updates on
                    <span>
                        <img
                            src="/assets/whatsapp_logo.png"
                            alt="whatsapp_logo"
                            width={25}
                            height={25}
                        />
                    </span>
                    WhatsApp
                </span>
            </div>
        </div>
    )
}

export default BasicInfoModal
