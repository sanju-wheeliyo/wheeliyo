import React from 'react'
import { Input } from 'antd'

export default function InputPassword({
    label,
    value,
    error = null,
    onChange,
    placeholder,
    type = 'text',
    className = 'rounded-full p-3 border border-solid border-[#94A3B8]',
}) {
    const isError = error !== null
    const [passwordVisible, setPasswordVisible] = React.useState(false)
    return (
        <div className="w-full">
            {label && (
                <p className="text-[#475569] text-[24px] font-normal leading-[23px] mb-2">
                    {label}
                </p>
            )}
            <Input.Password
                type={type}
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}

                className={`w-full plus-jakarta-sans password-input ${className} ${isError && 'border border-solid border-[#D12E34]'
                    }`}
            />
            {/* <Input
        type={type}
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${className} ${
          isError && "border border-solid border-[#D12E34]"
        }`}
      /> */}
            {error && (
                <p className="text-[#D12E34] text-sm plus-jakarta-sans font-normal mt-2">
                    {error?.message}
                </p>
            )}
        </div>
    )
}
