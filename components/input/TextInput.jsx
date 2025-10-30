import React from 'react'
import { Input } from 'antd'

export default function TextInput({
    label,
    value,
    error = null,
    onChange,
    placeholder,
    type = 'text',
    className = 'rounded-full p-3 border border-solid border-[#94A3B8]',
}) {
    const isError = error !== null

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace') {
            if (value === '+91') {
                e.preventDefault();
            }
        }
    };

    return (
        <div className="w-full">
            {label && (
                <p className="text-[#475569] text-[14px] font-normal leading-[23px] mb-2">
                    {label}
                </p>
            )}
            <Input
                type={type}
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                onKeyDown={handleKeyDown}
                className={`w-full ${className} ${isError && 'border border-solid border-[#D12E34]'
                    }`}
            />
            {error && (
                <p className="text-[#D12E34] text-sm plus-jakarta-sans font-normal mt-2">
                    {error?.message}
                </p>
            )}
        </div>
    )
}
