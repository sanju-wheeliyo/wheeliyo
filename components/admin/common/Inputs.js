'use client'

import { Input } from 'antd'

export default function Inputs({ placeholder }) {
    return (
        <>
            <span>
                <Input
                    className="w-full p-4 pr-12 border border-solid border-[#94A3B8] rounded-md"
                    placeholder={placeholder}
                />
            </span>
        </>
    )
}
