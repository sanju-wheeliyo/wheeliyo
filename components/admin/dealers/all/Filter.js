'use client'
import React, { useEffect, useState } from 'react'
import debounce from 'lodash.debounce'
import Search from 'components/admin/common/Search'

export default function Filter({ filters, setFilters, endAdornment = null }) {
    const handleFilers = (key, value) => {
        setFilters((prev) => {
            return {
                ...prev,
                [key]: value,
            }
        })
    }

    const debouncedHandleFilers = debounce(
        (key, value) => handleFilers(key, value),
        1000
    )

    return (
        <div className="w-full pt-4">
            <ul className="w-full flex items-center justify-between">
                <li className="lg:w-full w-1/2 py-2 lg:max-w-[351px]">
                    <Search
                        placeholder="Search"
                        // value={} // need to set values on controlled components only
                        onChange={(e) => {
                            debouncedHandleFilers('search', e.target.value)
                        }}
                    />
                </li>
                {endAdornment && (
                    <div className="pl-3 w-1/2 flex justify-end lg:w-1/4">
                        {endAdornment}
                    </div>
                )}
            </ul>
        </div>
    )
}
