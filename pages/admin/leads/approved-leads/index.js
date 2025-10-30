'use client'
import React, { useContext, useEffect, useState } from 'react'

import AdminLayout from 'components/layouts/AdminLayout'
import Filter from 'components/admin/leads/Filter'
import { useRouter } from 'next/router'
import AdminContext from 'lib/context/AdminContext'
import useApi from 'lib/hooks/useApi'
import LeadsApi from 'lib/services/car.services'
import TableView from 'components/display/TableView'
import Tags from 'components/admin/common/Tags'
import { useConfirm } from 'lib/hooks/useConfirm'
import { useQueryClient } from 'react-query'
import useToast from 'lib/hooks/useToast'
import { ActionColoumn } from 'components/admin/common/ActionColumn'

function ApprovedLeads() {
    const cacheKey = 'ApprovedLeads'
    const [filters, setFilters] = useState({
        yom: null,
        yom_min: null,
        yom_max: null,
        search: null,
        brand_id: null,
        state: null,
        minKilometers: null,
        maxKilometers: null,
    })

    const [editModal, setEditModal] = useState(false)
    const [viewModal, setViewModal] = useState(false)

    const [isSelectedAll, setIsSelectedAll] = useState(null)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // hooks
    const router = useRouter()
    const { isConfirmed } = useConfirm()
    const queryClient = useQueryClient()
    const { success, error } = useToast()
    const { setHeader, setHeaderIcon, setBreadCumpsList, setCurremtTab } =
        useContext(AdminContext)

    // apis
    const API_getLeads = useApi(LeadsApi.getAllLeads)

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1)
    }, [filters])

    const handlePageChange = (newPage, newPageSize) => {
        setPage(newPage)
        setPageSize(newPageSize || pageSize)
    }

    useEffect(() => {
        setBreadCumpsList([
            { title: 'Leads', id: 1 },
            { title: 'Approved leads', id: 2 },
        ])
        setCurremtTab(2)
        setHeader('Approved leads')
        setHeaderIcon('/assets/common/sidenav/leads-color.svg')
    }, [router])

    const columns = [
        {
            title: 'Share contact',
            render: () => 'Approved',
        },
        {
            title: 'Owner Name',
            render: (item) =>
                `${item?.owner?.name ? item?.owner?.name : 'NIL'}`,
        },
        {
            title: 'Contact number',
            render: (item) => (
                <div>
                    {item?.owner?.contact ? (
                        <span className="">{item?.owner?.contact}</span>
                    ) : (
                        'NIL'
                    )}
                </div>
            ),
        },
        {
            title: 'Brand & Model',
            render: (item) =>
                `${item?.brand ? item?.brand?.name : 'NIL'}-${item?.model ? item?.model?.name : 'NIL'
                }`,
        },
        {
            title: 'State & Year',
            render: (item) =>
                `${item?.vehicle?.registered_state
                    ? item?.vehicle?.registered_state
                    : 'NIL'
                }-${item?.vehicle?.year_of_manufacture
                    ? item?.vehicle?.year_of_manufacture
                    : 'NIL'
                }`,
        },
        {
            title: 'Variant',
            render: (item) => `${item?.variant ? item?.variant?.name : 'NIL'}`,
        },
        {
            title: 'Kms driven',
            render: (item) =>
                item?.vehicle
                    ? `${item.vehicle.min_kilometers || 0}${item.vehicle.max_kilometers
                        ? ` - ${item.vehicle.max_kilometers} kms`
                        : ' kms'
                    }`
                    : 'NIL',
        },
        {
            title: 'Type',
            render: (item) => (
                <Tags
                    tagcontent={
                        item?.car_type === 'pre-owned'
                            ? 'User-Owned'
                            : 'Bank Auction'
                    }
                />
            ),
        },
        {
            title: 'Action',
            render: (item) => (
                <ActionColoumn
                    item={item}
                    error={error}
                    success={success}
                    cacheKey="ApprovedLeads"
                    isConfirmed={isConfirmed}
                    queryClient={queryClient}
                />
            ),
        },
    ]

    return (
        <>
            <div className="w-full flex flex-col gap-4">
                <Filter
                    filters={filters}
                    cacheKey={cacheKey}
                    setFilters={setFilters}
                    approveButtonLabel="Hide"
                    selectedIds={selectedRowKeys}
                    isSelectedAll={isSelectedAll}
                    setIsSelectedAll={setIsSelectedAll}
                    setSelectedRowKeys={setSelectedRowKeys}
                />
                {/* <LeadsTable /> */}
                <div className="w-full flex justify-end">
                    <span
                        className="w-fit pl-4 underline text-[#d01768] cursor-pointer hover:text-[#F55C33]"
                        onClick={() => setFilters({
                            yom: null,
                            yom_min: null,
                            yom_max: null,
                            search: null,
                            brand_id: null,
                            state: null,
                            minKilometers: null,
                            maxKilometers: null,
                        })}
                    >
                        clear all
                    </span>
                </div>
                <div className="w-full overflow-y-auto">
                    <div className="w-full min-w-[1000px]">
                        <TableView
                            api={API_getLeads}
                            tableHeaders={columns}
                            isRowSelection={true}
                            cacheKey={[cacheKey, filters, page]}
                            otherParams={{
                                ...filters,
                                isApproved: true,
                                page,
                                size: pageSize,
                                // sortBy: 'approved-added',
                            }}
                            setSelected={true}
                            pagination={true}
                            selectedRowKeys={selectedRowKeys}
                            setSelectedRowKeys={setSelectedRowKeys}
                            isSelectedAll={isSelectedAll}
                            setIsSelectedAll={setIsSelectedAll}
                            extractData={(res) => res?.data?.data}
                            extractTotalCount={(res) =>
                                res?.data?.meta?.totalCount
                            }
                            loading={API_getLeads.loading}
                            onPaginationChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

ApprovedLeads.layout = AdminLayout
export default ApprovedLeads
