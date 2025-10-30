import React, { useRef } from 'react'
import { DatePicker } from 'antd'

export default function DateInput({
    label,
    value,
    error = null,
    onChange,
    placeholder,
    isTimePicker = true,
    format = 'DD/MM/YYYY hh:mm A',
    className = 'rounded-full p-3 border border-solid border-[#94A3B8]',
    ...props
}) {
    const ref = useRef()

    const isError = error !== null
    return (
        <div className="w-full">
            {label && (
                <p className="text-[#475569] text-[14px] font-normal leading-[23px] mb-2">
                    {label}
                </p>
            )}
            <DatePicker
                ref={ref}
                value={value}
                format={format}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full ${className} ${
                    isError && 'border border-solid border-[#D12E34]'
                }`}
                showTime={isTimePicker ? { use12Hours: false } : false}
                {...props}
            />
            {error && (
                <p className="text-[#D12E34] plus-jakarta-sans text-sm font-normal leading-[23px] mt-2">
                    {error?.message}
                </p>
            )}
        </div>
    )
}
