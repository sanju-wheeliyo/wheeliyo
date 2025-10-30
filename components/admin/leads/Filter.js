'use client'
import React, { useState, useEffect } from 'react'
import Search from '../common/Search'
import AddLeadModal from 'components/modals/AddLeadModal'
import Button from 'components/input/Button'
import SelectInput from '../common/Select'
import debounce from 'lodash.debounce'
import { useListBrands } from 'lib/hooks/useCarService'
import { getYears } from 'lib/utils/getYears'
import { getKms } from 'lib/utils/getKms'
import { getStates } from 'lib/utils/getStates'
import { extractKilometers } from 'lib/utils/helper'
import LeadStatusChangeModal from 'components/pages/leads/LeadStatusChangeModal'

export default function Filter({
    filters,
    cacheKey,
    selectedIds,
    setFilters,
    isSelectedAll,
    setIsSelectedAll,
    setSelectedRowKeys,
    approveButtonLabel = 'Approve/Hide',
}) {
    const [statusModal, setStatusModal] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleModal = () => {
        setIsModalOpen(!isModalOpen)
    }

    const handleStatusModal = () => {
        setStatusModal(!statusModal)
    }

    const handleFilers = (key, value) => {
        setFilters((prev) => {
            // Handle year range filtering
            if (key === 'yom' && value && value.startsWith('range_')) {
                const [_, minYear, maxYear] = value.split('_')
                return {
                    ...prev,
                    yom: null, // Clear single year filter
                    yom_min: parseInt(minYear),
                    yom_max: parseInt(maxYear),
                }
            } else if (key === 'yom' && value && !value.startsWith('range_')) {
                // Single year filter
                return {
                    ...prev,
                    yom: value,
                    yom_min: null, // Clear range filters
                    yom_max: null,
                }
            } else if (key === 'yom' && !value) {
                // Clear year filter
                return {
                    ...prev,
                    yom: null,
                    yom_min: null,
                    yom_max: null,
                }
            } else {
                return {
                    ...prev,
                    [key]: value,
                }
            }
        })
    }

    const handleKmsChange = (min, max) => {
        setFilters({
            ...filters,
            minKilometers: min,
            maxKilometers: max,
        })
    }

    const debouncedHandleFilers = debounce(
        (key, value) => {
            handleFilers(key, value)
        },
        500
    )

    // drop data brand
    const { data: brandList, isLoading: isBrandsLoading } = useListBrands({
        type: 'all',
        limit: 9,
    })
    const brands = brandList?.data

    // years
    const years = getYears()

    const filterdYears = years?.map((year) => ({
        label: year,
        value: year,
    }))

    // Add special year range options
    const currentYear = new Date().getFullYear()
    const yearRangeOptions = [
        {
            label: `Under 1 Year (${currentYear})`,
            value: `range_${currentYear}_${currentYear}`,
            type: 'range'
        },
        {
            label: `Last 2 Years (${currentYear-1}-${currentYear})`,
            value: `range_${currentYear-1}_${currentYear}`,
            type: 'range'
        },
        {
            label: `Last 3 Years (${currentYear-2}-${currentYear})`,
            value: `range_${currentYear-2}_${currentYear}`,
            type: 'range'
        }
    ]

    // Combine single years and year ranges
    const allYearOptions = [...yearRangeOptions, ...filterdYears]

    // Debug filter state changes
    useEffect(() => {
        // Filter state changes handled silently
    }, [filters])

    // kilometers
    const kms = getKms()

    // states
    const states = getStates()

    return (
        <>
            <div className="w-full pt-4">
                <ul className="w-full flex flex-wrap">
                    <li className="w-full sm:w-1/2 md:w-1/3 xl:w-1/4 p-2 !pl-0 pr-0 sm:pr-2">
                        <Search
                            placeholder="Search"
                            value={filters?.search}
                            onChange={(e) => {
                                debouncedHandleFilers('search', e.target.value)
                            }}
                        />
                    </li>
                    <li className="w-full sm:w-1/2 md:w-1/3 xl:w-[15%] py-2 md:p-2  md:pr-0 lg:pr-2">
                        <span className="block">
                            <SelectInput
                                labelKey="name"
                                // placeholder="Brand"
                                className="select-input-rounded-md"
                                placeholder={
                                    <React.Fragment>
                                        <div className="flex items-center gap-1">
                                            <img
                                                className=""
                                                alt="verified"
                                                src={
                                                    '/assets/common/filter-gray.svg'
                                                }
                                                width={14}
                                                height={12}
                                            />
                                            &nbsp; <div>Brand</div>
                                        </div>
                                    </React.Fragment>
                                }
                                // value={{ label: filters?.brand || "" }}
                                value={filters?.brand_id}
                                options={brands}
                                onChange={(e, v) => {
                                    debouncedHandleFilers('brand_id', e?.value)
                                }}
                            />
                        </span>
                    </li>
                    <li className="w-full sm:w-1/2 md:w-1/3 xl:w-[15%] py-2 md:p-2  md:pr-0 lg:pr-2">
                        <span className="block">
                            <SelectInput
                                className="select-input-rounded-md"
                                placeholder={
                                    <React.Fragment>
                                        <div className="flex items-center gap-1">
                                            <img
                                                className=""
                                                alt="verified"
                                                src={
                                                    '/assets/common/filter-gray.svg'
                                                }
                                                width={14}
                                                height={12}
                                            />
                                            &nbsp; <div>Year</div>
                                        </div>
                                    </React.Fragment>
                                }
                                // placeholder="Year"
                                options={allYearOptions}
                                valueKey="value"
                                value={
                                    filters?.yom_min !== null && filters?.yom_max !== null && 
                                    filters?.yom_min !== undefined && filters?.yom_max !== undefined &&
                                    !isNaN(filters.yom_min) && !isNaN(filters.yom_max)
                                        ? `range_${filters.yom_min}_${filters.yom_max}`
                                        : filters?.yom || null
                                }
                                onChange={(e, v) => {
                                    debouncedHandleFilers('yom', e?.value)
                                }}
                            />
                        </span>
                    </li>
                    <li className="w-full sm:w-1/2 md:w-1/3 xl:w-[15%] py-2 md:p-2  md:pr-0 lg:pr-2">
                        <span className="block">
                            <SelectInput
                                className="select-input-rounded-md"
                                placeholder={
                                    <React.Fragment>
                                        <div className="flex items-center gap-1">
                                            <img
                                                className=""
                                                alt="verified"
                                                src={
                                                    '/assets/common/filter-gray.svg'
                                                }
                                                width={14}
                                                height={12}
                                            />
                                            &nbsp; <div>Kms </div>
                                        </div>
                                    </React.Fragment>
                                }
                                // placeholder="Kms"
                                options={kms}
                                value={
                                    filters?.minKilometers ||
                                    filters?.maxKilometers
                                        ? `${filters?.minKilometers}-${filters?.maxKilometers}`
                                        : null
                                }
                                valueKey="key"
                                onChange={(e, v) => {
                                    const kms = extractKilometers(e?.value)
                                    handleKmsChange(
                                        kms?.minKilometers,
                                        kms?.maxKilometers
                                    )
                                }}
                            />
                        </span>
                    </li>
                    <li className="w-full sm:w-1/2 md:w-1/3 xl:w-[15%] py-2 md:p-2  md:pr-0 lg:pr-2">
                        <span className="block">
                            <SelectInput
                                className="select-input-rounded-md"
                                placeholder={
                                    <React.Fragment>
                                        <div className="flex items-center gap-1">
                                            <img
                                                className=""
                                                alt="verified"
                                                src={
                                                    '/assets/common/filter-gray.svg'
                                                }
                                                width={14}
                                                height={12}
                                            />
                                            &nbsp; <div>State </div>
                                        </div>
                                    </React.Fragment>
                                }
                                // placeholder="State"
                                onChange={(e, v) => {
                                    debouncedHandleFilers('state', e?.label)
                                }}
                                value={filters?.state}
                                options={states}
                                labelKey="label"
                                valueKey="key"
                            />
                        </span>
                    </li>
                    <li className="w-full sm:w-1/2 md:w-1/3 xl:w-[15%] py-2 md:p-2  md:pr-0 lg:pr-2 !pr-0 relative">
                        {isSelectedAll || selectedIds?.length > 0 ? (
                            <Button
                                className="w-full py-[7px] btn-gradient rounded-[10px] text-white border border-solid border-[#d01768]"
                                type="primary"
                                onClick={handleStatusModal}
                            >
                                <span>{approveButtonLabel}</span>
                            </Button>
                        ) : (
                            <Button
                                className="w-full py-[7px] btn-gradient rounded-[10px] text-white border border-solid border-[#d01768]"
                                type="primary"
                                onClick={handleModal}
                            >
                                <div className="flex justify-center gap-2">
                                    <img src="/assets/common/plus-icon.svg" />
                                    <span>Add new lead</span>
                                </div>
                            </Button>
                        )}

                        <AddLeadModal
                            isModalOpen={isModalOpen}
                            handleModal={handleModal}
                        />
                        <LeadStatusChangeModal
                            cacheKey={cacheKey}
                            open={statusModal}
                            ids={selectedIds}
                            defaultValue={
                                approveButtonLabel === 'Approve'
                                    ? 'approve'
                                    : approveButtonLabel === 'Hide'
                                    ? 'unapprove'
                                    : null
                            }
                            handleCancel={() => setStatusModal(false)}
                            setIsSelectedAll={setIsSelectedAll}
                            setSelectedRowKeys={setSelectedRowKeys}
                        />
                        {/* <div className="modal w-full h-screen bg-[#000000] bg-opacity-70 fixed z-[99] left-0 top-0 right-0 bottom-0 flex justify-center items-center">
                  <div className="w-full max-w-[600px] bg-[#ffffff] rounded-2xl p-8">fgfgfgf</div>
                </div> */}
                    </li>
                </ul>
            </div>
        </>
    )
}
