'use client'
import React, { useContext, useEffect, useState } from 'react'

import TableView from 'components/display/TableView'
import AdminLayout from 'components/layouts/AdminLayout'
import Filter from 'components/admin/dealers/all/Filter'
import { Pad } from 'lib/utils/helper'
import { useRouter } from 'next/router'
import AdminContext from 'lib/context/AdminContext'
import dayjs from 'dayjs'
import useApi from 'lib/hooks/useApi'
import contactApis from 'lib/services/contact.services'
import { useQueryClient } from 'react-query'
import { useConfirm } from 'lib/hooks/useConfirm'
import useToast from 'lib/hooks/useToast'
import QueryDetailsModal from 'components/modals/QueryDetailsModal'
import Tags from 'components/admin/common/Tags'

function Queries() {
    const API_getQueries = useApi(contactApis.listQueries)

    const [filters, setFilters] = useState({
        search: null,
    })
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { success, error } = useToast()
    const queryClient = useQueryClient()
    const { isConfirmed } = useConfirm()

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
            { title: 'Enquiries', id: 1 },
            // { title: 'All dealers', id: 2, onClick: () => {} },
        ])
        setCurremtTab(1)
        setHeader('Enquiries')
        setHeaderIcon('/assets/common/sidenav/enquries-gradient.svg')
    }, [router])

    const columns = [
        {
            title: 'SI No',
            render: (_, __, index) => Pad((page - 1) * pageSize + index + 1),
        },
        {
            title: 'Full name',
            render: (item) => item?.first_name + ' ' + item?.last_name,
        },
        {
            title: 'Email address',
            render: (item) => item?.email,
        },
        {
            title: 'Phone number',
            render: (item) => item?.phone,
        },

        {
            title: 'Subject',
            render: (item) => <Tags tagcontent={item?.query_type} />,
        },
        {
            title: 'Action',
            align: 'left',
            render: (item) => (
                <ActionColoumn
                    item={item}
                    isConfirmed={isConfirmed}
                    queryClient={queryClient}
                    success={success}
                    error={error}
                />
            ),
        },
    ]

    return (
        <div className="w-full flex flex-col gap-4">
            <Filter filters={filters} setFilters={setFilters} />
            <div className="w-full ">
                <div className="w-full overflow-y-auto ">
                    <TableView
                        api={API_getQueries}
                        tableHeaders={columns}
                        cacheKey={['Queries', filters, page]}
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

Queries.layout = AdminLayout
export default Queries

const ActionColoumn = ({ item, success, queryClient, error, isConfirmed }) => {
    const [modal, setModal] = useState(false)

    const API_deleteAQuery = useApi(contactApis.deleteAQuery)

    const handleDeleteQuery = async (id) => {
        try {
            if (
                await isConfirmed({
                    title: 'Delete enquiry?',
                    description:
                        'Are you sure you want to delete this enquiry?',
                    confirmButtonLabel: 'Delete',
                    cancelButtonLabel: 'Cancel',
                })
            ) {
                const res = await API_deleteAQuery.request(id)
                if (res?.isError) {
                    error('Failed to delete this query.')
                } else {
                    success('Query deleted successfully')
                    queryClient.invalidateQueries(['Queries'])
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleViewModal = () => {
        setModal(!modal)
    }

    return (
        <ul className="flex justify-left items-center">
            <li className="pr-2">
                <span
                    onClick={handleViewModal}
                    className="block w-5 cursor-pointer"
                >
                    <img className="w-full" src="/assets/common/eye.svg" />
                </span>
                <QueryDetailsModal
                    item={item}
                    handleModal={handleViewModal}
                    isModalOpen={modal}
                />
            </li>
            <li className="px-2">
                <span className="block w-5 cursor-pointer">
                    <img
                        className="w-full cursor-pointer"
                        onClick={() => handleDeleteQuery(item?._id)}
                        src="/assets/common/delete-gradient.svg"
                    />
                </span>
            </li>
        </ul>
    )
}
