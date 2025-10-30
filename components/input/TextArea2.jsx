import React from 'react'

export default function TextArea2({
    rows = 4,
    label,
    value,
    error = null,
    onChange,
    placeholder,
    type = 'text',
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
                className={`p-2 w-full h-32 bg-transparent border-b border-solid border-[#000000] ${isError && 'border-b border-solid border-[#000000]'
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
