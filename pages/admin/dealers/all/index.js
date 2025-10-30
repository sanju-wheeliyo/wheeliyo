'use client'
import React, { useContext, useEffect, useState } from 'react'

import AdminLayout from 'components/layouts/AdminLayout'
import Filter from 'components/admin/dealers/all/Filter'
import TableView from 'components/display/TableView'
import DealersApi from 'lib/services/dealers.services'
import useApi from 'lib/hooks/useApi'
import AdminContext from 'lib/context/AdminContext'
import { useRouter } from 'next/router'
function All() {
    const [filters, setFilters] = useState({
        search: null,
    })
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // hooks
    const router = useRouter()
    const { setHeader, setHeaderIcon, setBreadCumpsList, setCurremtTab } =
        useContext(AdminContext)

    // apis
    const API_allDealers = useApi(DealersApi.getDealers)

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1)
    }, [filters])

    const handlePageChange = (newPage, newPageSize) => {
        setPage(newPage)
        setPageSize(newPageSize || pageSize)
    }

    const columns = [
        {
            title: 'Dealer Name',
            render: (item) => `${item?.name ? item?.name : 'NIL'}`,
        },
        {
            title: 'Phone',
            render: (item) => (
                <span className="text-[#475569]">
                    {item?.phone ? item?.phone : 'NIL'}
                </span>
            ),
        },
    ]

    useEffect(() => {
        setBreadCumpsList([
            { title: 'Dealers', id: 1 },
            { title: 'All dealers', id: 2 },
        ])
        setCurremtTab(2)
        setHeader('All dealers')
        setHeaderIcon('/assets/common/sidenav/dealer-color.svg')
    }, [router])

    return (
        <div className="w-full flex flex-col gap-4">
            <Filter filters={filters} setFilters={setFilters} />
            <div className="w-full ">
                <div className="w-full overflow-y-auto">
                    <TableView
                        api={API_allDealers}
                        tableHeaders={columns}
                        cacheKey={['AllDealers', filters, page]}
                        otherParams={{
                            ...filters,
                            page,
                            size: pageSize,
                        }}
                        pagination={true}
                        extractData={(res) => res?.data?.data}
                        extractTotalCount={(res) => res?.data?.meta?.totalCount}
                        onPaginationChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    )
}

All.layout = AdminLayout
export default All
