import React from 'react'

export default function Button({
    onClick,
    children,
    loading = false,
    disabled = false,
    additionalClass = '',
    className = ' text-white btn-gradient text-lg rounded-full',
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`w-full p-3  ${
                disabled && 'opacity-50'
            } ${className} ${additionalClass}`}
        >
            {loading ? 'Loading...' : children}
        </button>
    )
}
