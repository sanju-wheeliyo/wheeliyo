'use client'
import React, { useContext, useEffect, useState } from 'react'

import { useQuery } from 'react-query'
import TableView from 'components/display/TableView'
import AdminLayout from 'components/layouts/AdminLayout'
import Filter from 'components/admin/dealers/all/Filter'
import CitiesApi from 'lib/services/cities.services'
import { useRouter } from 'next/router'
import AdminContext from 'lib/context/AdminContext'
import Button from 'components/input/Button'
import CityModal from 'components/modals/AddNewCityModal'
import { useConfirm } from 'lib/hooks/useConfirm'
import { useQueryClient } from 'react-query'
import useToast from 'lib/hooks/useToast'

function Cities() {
    const [modal, setModal] = useState(false)
    const [filters, setFilters] = useState({
        search: null,
    })
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const router = useRouter()
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    const { isConfirmed } = useConfirm()

    const { setHeader, setHeaderIcon, setBreadCumpsList, setCurremtTab } =
        useContext(AdminContext)

    useEffect(() => {
        setBreadCumpsList([
            { title: 'Manage data', id: 1 },
            { title: 'Available Cities', id: 2, onClick: () => { } },
        ])
        setCurremtTab(2)
        setHeader('Available Cities')
        setHeaderIcon('/assets/common/sidenav/manage-data-gradient.svg')
    }, [router])

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1)
    }, [filters])

    const handlePageChange = (newPage, newPageSize) => {
        setPage(newPage)
        setPageSize(newPageSize || pageSize)
    }

    // Create a custom API object that works with React Query
    const citiesApi = {
        request: async (params) => {
            try {
                const response = await CitiesApi.listCities(params)
                return {
                    isError: false,
                    data: response.data,
                    errors: [],
                }
            } catch (err) {
                return {
                    isError: true,
                    errors: err?.response?.data?.errors || [{ message: err?.response?.data?.message || err?.message || 'Network error' }],
                }
            }
        }
    }

    const columns = [
        {
            title: 'City',
            render: (item) => `${item?.name}`,
        },
        {
            title: 'Action',
            align: 'right',
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

    const handleModal = () => {
        setModal(!modal)
    }
    return (
        <div className="w-full flex flex-col gap-4">
            <Filter
                filters={filters}
                setFilters={setFilters}
                endAdornment={
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleModal}
                            additionalClass="!p-2 !px-6"
                            className="w-fit flex justify-center border-xs-button btn-gradient"
                        >
                            <div className="flex justify-center items-center gap-2">
                                <img src="/assets/common/plus-icon.svg" className="w-4 h-4" />
                                <span className="whitespace-nowrap">
                                    Add new city
                                </span>
                            </div>
                        </Button>
                    </div>
                }
            />
            <div className="w-full">
                <div className="w-full overflow-y-auto ">
                    <TableView
                        api={citiesApi}
                        tableHeaders={columns}
                        cacheKey={['Cities', filters, page]}
                        otherParams={{ ...filters, page, size: pageSize }}
                        pagination={true}
                        extractData={(res) => {
                            const data = res?.data?.data || res?.data;

                            // Ensure we have an array and remove any duplicates
                            if (Array.isArray(data)) {
                                // Remove duplicates based on _id
                                const uniqueData = data.filter((item, index, self) =>
                                    index === self.findIndex(t => t._id === item._id)
                                );

                                return uniqueData;
                            }

                            return data || [];
                        }}
                        extractTotalCount={(res) => res?.data?.meta?.totalCount || 0}
                        onPaginationChange={handlePageChange}
                    />
                </div>
            </div>
            <CityModal
                mode={'add'}
                isModalOpen={modal}
                handleModal={handleModal}
            />
        </div>
    )
}

Cities.layout = AdminLayout
export default Cities

const ActionColoumn = ({ item, success, queryClient, error, isConfirmed }) => {
    const [editModal, setEditModal] = useState(false)

    const handleDeleteCity = async (id) => {
        try {
            if (
                await isConfirmed({
                    title: 'Delete this city',
                    description: 'Are you sure you want to delete this city ?',
                    confirmButtonLabel: 'Yes',
                    cancelButtonLabel: 'No',
                })
            ) {
                const res = await CitiesApi.deleteACity(id)
                if (res?.isError) {
                    error('Failed to delete this city.')
                } else {
                    success('City deleted successfully')
                    queryClient.invalidateQueries(['Cities'])
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleEditModal = () => {
        setEditModal(!editModal)
    }

    return (
        <ul className="flex justify-end items-center">
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
                <CityModal
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
                        onClick={() => handleDeleteCity(item?._id)}
                        src="/assets/common/delete-gradient.svg"
                    />
                </span>
            </li>
        </ul>
    )
}
