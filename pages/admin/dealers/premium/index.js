'use client'
import React, { useContext, useEffect, useState } from 'react'
import AdminLayout from 'components/layouts/AdminLayout'
import Filter from 'components/admin/dealers/all/Filter'
import TableView from 'components/display/TableView'
import DealersApi from 'lib/services/dealers.services'
import useApi from 'lib/hooks/useApi'
import { useRouter } from 'next/router'
import AdminContext from 'lib/context/AdminContext'
import dayjs from 'dayjs'
import DealersInvoiceModal from 'components/modals/DealersInvoiceModal'
import Tags from 'components/admin/common/Tags'
import ViewInvoice from 'components/admin/dealers/premium/ViewInvoice'

function Premium() {
    const [filters, setFilters] = useState({
        search: null,
    })
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [invoiceItemId, setInvoiceItemId] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { setHeader, setHeaderIcon, setBreadCumpsList, setCurremtTab } =
        useContext(AdminContext)
    const API_allDealers = useApi(DealersApi.getDealers)

    const handleFormatPhoneNumber = (item) => {
        const formattedPhone = item?.phone || null
        if (formattedPhone) {
            window.location.href = `tel:${formattedPhone}`
        }
    }

    const handlePageChange = (page, pageSize) => {
        setPage(page)
        setPageSize(pageSize)
    }

    const columns = [
        {
            title: 'Dealer Name',
            render: (item) => item?.name || 'NIL',
        },
        {
            title: 'Phone',
            render: (item) => (
                <a href={() => handleFormatPhoneNumber(item)}>
                    {item?.phone || 'NIL'}
                </a>
            ),
        },
        {
            title: 'Starting date',
            render: (item) => {
                return (
                    <div className="flex flex-col gap-4">
                        {item?.activeSubscriptions && item.activeSubscriptions.length > 0
                            ? item.activeSubscriptions.map((plan, i) => (
                                <p className="text-[14px]" key={i}>
                                    {plan?.start_date 
                                        ? dayjs(plan.start_date).format('DD/MM/YYYY')
                                        : 'No start date'
                                    }
                                </p>
                            ))
                            : 'NIL'}
                    </div>
                )
            },
        },
        {
            title: 'Ending date',
            render: (item) => {
                return (
                    <div className="flex flex-col gap-4">
                        {item?.activeSubscriptions && item.activeSubscriptions.length > 0
                            ? item.activeSubscriptions.map((plan, i) => (
                                <p className="text-[14px]" key={i}>
                                    {plan?.end_date 
                                        ? dayjs(plan.end_date).format('DD/MM/YYYY')
                                        : 'No end date'
                                    }
                                </p>
                            ))
                            : 'NIL'}
                    </div>
                )
            },
        },
        // {
        //     title: 'Types',
        //     render: (item) => {
        //         return (
        //             <div className="flex flex-col gap-4">
        //                 {item?.activeSubscriptions?.map((item, i) => (
        //                     <Tags
        //                         key={i}
        //                         tagcontent={
        //                             item?.plan_details?.type === 'pre-owned'
        //                                 ? 'User-Owned'
        //                                 : item?.plan_details?.type === 'auction'
        //                                 ? 'Bank Auction'
        //                                 : 'NIL'
        //                         }
        //                     />
        //                 ))}
        //             </div>
        //         )
        //     },
        // },

        {
            title: '',
            render: (item) => {
                return <ViewInvoice item={item} />
            },
        },
    ]

    useEffect(() => {
        setBreadCumpsList([
            { title: 'Dealers', id: 1 },
            { title: 'Premium dealers', id: 2 },
        ])
        setCurremtTab(2)
        setHeader('Premium dealers')
        setHeaderIcon('/assets/common/sidenav/dealer-color.svg')
    }, [setBreadCumpsList, setCurremtTab, setHeader, setHeaderIcon])

    return (
        <>
            <div className="w-full flex flex-col gap-4">
                <Filter filters={filters} setFilters={setFilters} />
                <div className="w-full ">
                    <div className="w-full overflow-y-auto">
                        <TableView
                            api={API_allDealers}
                            tableHeaders={columns}
                            cacheKey={['PremiumDealers', filters, page]}
                            otherParams={{
                                ...filters,
                                is_premium: true,
                                page,
                                size: pageSize,
                            }}
                            pagination={true}
                            extractData={(res) => res?.data?.data}
                            extractTotalCount={(res) =>
                                res?.data?.meta?.totalCount
                            }
                            onPaginationChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
            <DealersInvoiceModal
                key={invoiceItemId}
                userId={invoiceItemId}
                isModalOpen={isModalOpen}
                handleOk={() => setIsModalOpen(false)}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}

Premium.layout = AdminLayout
export default Premium
