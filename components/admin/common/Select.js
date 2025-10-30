'use client'
import React from 'react'
import { Select } from 'antd'

export default function SelectInput({
    label,
    value,
    error = null,
    placeholder,
    options,
    onChange,
    labelKey = 'label',
    valueKey = '_id',
    otherKey,
    disabled,
    disabledSearch = false,
    className = 'rounded-full p-3 border border-solid border-[#94A3B8]',
}) {
    const isError = error !== null

    const fileteredOptions = options?.map((item) => ({
        label: item[labelKey] || '',
        value: item[valueKey],
        [otherKey]: item[otherKey],
    }))

    return (
        <div className="w-full">
            {label && (
                <p className="text-[#475569] text-[14px] font-normal leading-[23px] mb-2">
                    {label}
                </p>
            )}
            <Select
                showSearch={!disabledSearch}
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                optionFilterProp="label"
                className={`w-full ${className} ${
                    isError && 'border border-solid border-[#D12E34]'
                }`}
                onChange={(value, option) => onChange(option)}
                options={fileteredOptions}
                virtual={false}
            />
        </div>
    )
}
