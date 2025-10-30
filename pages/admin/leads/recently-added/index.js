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
import LeadDetailsModal from 'components/modals/LeadDetailsModal'
import AddLeadModal from 'components/modals/AddLeadModal'

function RecentLeads() {
    const cacheKey = 'Leads'

    const [filters, setFilters] = useState({
        yom: null,
        yom_min: null,
        yom_max: null,
        search: null,
        brand: null,
        state: null,
        minKilometers: null,
        maxKilometers: null,
    })

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
            { title: 'Recently added', id: 2 },
        ])
        setCurremtTab(2)
        setHeader('Recently added')
        setHeaderIcon('/assets/common/sidenav/leads-color.svg')
    }, [router])

    const columns = [
        {
            title: 'Share contact',
            render: (item) => `${item?.approved ? 'Approved' : 'Not Approved'}`,
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
        // {
        //     title: 'Variant',
        //     render: (item) =>
        //         `${item?.vehicle?.variant ? item?.vehicle?.variant : 'NIL'}`,
        // },
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
                    cacheKey="Leads"
                    success={success}
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
                    selectedIds={selectedRowKeys}
                    isSelectedAll={isSelectedAll}
                    setIsSelectedAll={setIsSelectedAll}
                    setSelectedRowKeys={setSelectedRowKeys}
                />
                <div className="w-full flex justify-end">
                    <span
                        className="w-fit pl-4 underline text-[#d01768] cursor-pointer hover:text-[#F55C33]"
                        onClick={() => setFilters({
                            yom: null,
                            yom_min: null,
                            yom_max: null,
                            search: null,
                            brand: null,
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
                            cacheKey={[cacheKey, filters, page]}
                            isRowSelection={true}
                            otherParams={{
                                ...filters,
                                sortBy: 'recently-added',
                                page,
                                size: pageSize,
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

RecentLeads.layout = AdminLayout
export default RecentLeads

const ActionColoumn = ({ item, success, queryClient, error, isConfirmed }) => {
    const [viewModal, setViewModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    const API_deleteLead = useApi(LeadsApi.deleteALead)

    const handleDeleteLead = async (id) => {
        try {
            if (
                await isConfirmed({
                    title: 'Delete this lead',
                    description: 'Are you sure you want to delete this lead ?',
                    confirmButtonLabel: 'Yes',
                    cancelButtonLabel: 'No',
                })
            ) {
                const res = await API_deleteLead.request(id)
                if (res?.isError) {
                    error('Failed to delete this lead.')
                } else {
                    success('Lead deleted successfully')
                    queryClient.invalidateQueries(['Leads'])
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleViewModal = () => {
        setViewModal(!viewModal)
    }

    const handleEditModal = () => {
        setEditModal(!editModal)
    }

    return (
        <ul className="flex items-center">
            <li className="pr-2">
                <span
                    onClick={handleViewModal}
                    className="block w-5 cursor-pointer"
                >
                    <img className="w-full" src="/assets/common/eye.svg" />
                </span>
                <LeadDetailsModal
                    item={item}
                    isModalOpen={viewModal}
                    handleModal={handleViewModal}
                    handleDelete={() => handleDeleteLead(item?._id)}
                />
            </li>
            <li className="px-2">
                <span
                    onClick={handleEditModal}
                    className="block w-5 cursor-pointer"
                >
                    <img
                        className="w-full"
                        src="/assets/common/edit-gradient.svg"
                    />
                </span>
                <AddLeadModal
                    mode="edit"
                    details={item}
                    isModalOpen={editModal}
                    handleModal={handleEditModal}
                />
            </li>
            <li className="px-2">
                <span className="block w-5 cursor-pointer">
                    <img
                        className="w-full cursor-pointer"
                        onClick={() => handleDeleteLead(item?._id)}
                        src="/assets/common/delete-gradient.svg"
                    />
                </span>
            </li>
        </ul>
    )
}
