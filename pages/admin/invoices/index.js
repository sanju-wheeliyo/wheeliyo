'use client'
import React, { useContext, useEffect, useState } from 'react'

import useApi from 'lib/hooks/useApi'
import TableView from 'components/display/TableView'
import AdminLayout from 'components/layouts/AdminLayout'
import Filter from 'components/admin/dealers/all/Filter'
import InvoicesApi from 'lib/services/invoices.services'
import { Pad } from 'lib/utils/helper'
import { useRouter } from 'next/router'
import AdminContext from 'lib/context/AdminContext'
import dayjs from 'dayjs'
import useToast from 'lib/hooks/useToast'
import leadApis from 'lib/services/car.services'

function Invoices() {
    const { success, error } = useToast()

    const [filters, setFilters] = useState({
        search: null,
    })
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const handlePageChange = (newPage, newPageSize) => {
        setPage(newPage)
        setPageSize(newPageSize)
    }

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1)
    }, [filters])

    const router = useRouter()
    const { setHeader, setHeaderIcon, setBreadCumpsList, setCurremtTab } =
        useContext(AdminContext)

    useEffect(() => {
        setBreadCumpsList([
            { title: 'Invoices', id: 1 },
            // { title: 'All dealers', id: 2, onClick: () => {} },
        ])
        setCurremtTab(1)
        setHeader('Invoices')
        setHeaderIcon('/assets/common/sidenav/invoice-color.svg')
    }, [router])

    const [clickedInvoice, setClickedInvoice] = useState({})
    const API_invoices = useApi(InvoicesApi.getInvoices)
    const API_downloadInvoice = useApi(InvoicesApi.downloadInvoice)

    const downloadPDF = async (id) => {
        try {
            console.log('Starting PDF download for ID:', id)
            setClickedInvoice({ _id: id })
            
            const res = await API_downloadInvoice.request(id)

            if (!res || !res.data) {
                error('Failed to download! No data received')
                setClickedInvoice({})
                return
            }
            
            console.log('PDF download response received:', {
                status: res.status,
                dataLength: res.data?.length,
                contentType: res.headers?.['content-type']
            })

            const blob = new Blob([res.data], { type: 'application/pdf' })
            const fileName = `invoice_${Date.now()}.pdf`
            const aElement = document.createElement('a')
            aElement.setAttribute('download', fileName)
            const href = URL.createObjectURL(blob)
            aElement.href = href
            aElement.setAttribute('target', '_blank')
            aElement.click()
            URL.revokeObjectURL(href)
            
            console.log('PDF download completed successfully')
            setClickedInvoice({})
        } catch (error) {
            console.error('Error occurred while downloading PDF:', error)
            error('Failed to download! Please try again.')
            setClickedInvoice({})
        }
    }

    const renderCustomerName = (data) => {
        if (!data) return 'Nil'

        const name = data?.user?.name || 'Nil'
        return (
            <div>
                <div>{name}</div>
            </div>
        )
    }

    const columns = [
        {
            title: 'SI No',
            render: (_, __, index) => Pad((page - 1) * pageSize + index + 1),
        },
        {
            title: 'Dealer',
            render: (item) => renderCustomerName(item),
        },
        {
            title: 'Date',
            render: (item) => {
                return item?.payment_date
                    ? dayjs(item?.payment_date).format('DD/MM/YYYY')
                    : 'Nil'
            },
        },
        {
            title: 'Invoice ID',
            render: (item) =>
                item?.payment_status === 'SUCCESS' && item?._id ? item?._id : 'Nil',
        },
        {
            title: 'Amount',
            render: (item) => {
                return ` ₹${item?.amount_total
                    ? parseFloat(item?.amount_total).toFixed(2)
                    : 'Nil'
                    }`
            },
        },
        {
            title: 'Status',
            render: (item) =>
                item?.payment_status === 'SUCCESS' ? (
                    <span className="text-[#317D35] font-[600]">{'Paid'}</span>
                ) : (
                    'Nil'
                ),
        },
        {
            title: '',
            render: (item) => {
                return API_downloadInvoice.loading &&
                    clickedInvoice?._id == item?._id ? (
                    <div>loading...</div>
                ) : (
                    <span
                        onClick={() => {
                            downloadPDF(item?._id)
                            setClickedInvoice(item)
                        }}
                        className="flex items-center cursor-pointer"
                    >
                        {/* {JSON.stringify(item)} */}
                        <span className="w-4 h-4 block cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/download.png"
                                alt="Download"
                            />
                        </span>
                        <span className="pl-2 block">Download</span>
                    </span>
                )
            },
        },
    ]

    return (
        <div className="w-full flex flex-col gap-4">
            <Filter filters={filters} setFilters={setFilters} />
            <div className="w-full ">
                <div className="w-full overflow-y-auto ">
                    <TableView
                        api={API_invoices}
                        tableHeaders={columns}
                        cacheKey={['Invoices', filters, page]}
                        otherParams={{ ...filters, page, size: pageSize }}
                        pagination={true}
                        extractData={(res) => res?.data?.data}
                        onPaginationChange={handlePageChange}
                        extractTotalCount={(res) => res?.data?.meta?.totalCount}
                    />
                </div>
            </div>
        </div>
    )
}

Invoices.layout = AdminLayout
export default Invoices
