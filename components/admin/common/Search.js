'use client'
import React from 'react'
import { Input } from 'antd'

export default function Search({
    placeholder = 'Search',
    value,
    onChange,
    ...props
}) {
    return (
        <>
            <span className="block relative">
                {/* <input
                    placeholder="Search"
                    className="w-full p-4 pr-12 border border-solid border-[#94A3B8] rounded-md"
                />
                <button className="w-8 h-8 cursor-pointer absolute w-[24px] top-[12px] right-4">
                    <img className="w-full" src="/assets/common/search.svg" />
                </button> */}
                <Input
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full p-2 pr-12 border border-solid border-[#94A3B8] rounded-2xl"
                />
                <button className="w-5 h-5 cursor-pointer absolute top-[10px] right-3">
                    <img className="w-full" src="/assets/common/search.svg" />
                </button>
            </span>
        </>
    )
}
