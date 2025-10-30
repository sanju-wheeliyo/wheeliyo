'use client'
import React from 'react'
import { Button, Flex } from 'antd'

export default function ButtonPrimary() {
    return (
        <>
            <span>
                <Button
                    className="w-full p-7 btn-gradient rounded-md text-white border border-solid border-[#d01768]"
                    type="primary"
                >
                    +Add new lead
                </Button>
            </span>
        </>
    )
}
