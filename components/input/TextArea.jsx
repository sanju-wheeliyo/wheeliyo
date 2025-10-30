import React from 'react'

export default function TextArea({
    rows = 4,
    label,
    value,
    error = null,
    onChange,
    placeholder,
    type = 'text',
    className = 'rounded-full p-3 border border-solid border-[#94A3B8]',
}) {
    const isError = error !== null
    return (
        <div className="w-full">
            {label && (
                <p className="text-[#475569] text-[14px] font-normal leading-[23px] mb-2">
                    {label}
                </p>
            )}
            <textarea
                rows={rows}
                type={type}
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full text-input ${className} ${
                    isError && 'border border-solid border-[#D12E34]'
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
