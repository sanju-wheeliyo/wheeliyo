import { Checkbox, Pagination, Table } from 'antd'
import useToast from 'lib/hooks/useToast'
import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'

export default function TableView({
    api,
    cacheKey,
    tableHeaders,
    tableRow,
    loading,
    isRowSelection = false,
    otherParams,
    isSelectedAll,
    setIsSelectedAll,
    handleReturnData,
    selectedRowKeys,
    setSelectedRowKeys,
    setSelected = false,
    onPaginationChange = () => { },
    extractData = (res) => res?.data?.data,
    extractTotalCount = (res) => res?.data?.meta?.totalCount,
    ...props
}) {
    const { error } = useToast()

    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState()
    const [pageSize, setPageSize] = useState(10)

    const handleTableChange = (pagination) => {
        setPage(pagination.current)
        setPageSize(pagination.pageSize)
    }

    async function getData() {
        const res = await api.request({
            page: page,
            size: pageSize,
            ...otherParams,
        })
        if (res.isError) {
            return error('Failed to fetch data')
        }
        setTotalCount(extractTotalCount(res))
        return extractData(res)
    }

    // Reset page to 1 when cacheKey changes (filters change)
    useEffect(() => {
        setPage(1)
    }, [cacheKey])

    const { data, isLoading: isQueryLoading } = useQuery(
        [...cacheKey, page],
        getData
    )
    const isLoading = isQueryLoading || loading
    const onChange = (page, pageSize) => {
        onPaginationChange(page, pageSize)
        setPage(page)
        if (pageSize) {
            setPageSize(pageSize)
        }
        if (setIsSelectedAll) {
            setIsSelectedAll(false)
        }
    }

    const rowSelection = {
        type: 'checkbox',
        selectedRowKeys: selectedRowKeys,
        columnTitle: (
            <Checkbox
                checked={isSelectedAll || false}
                onChange={(e) => {
                    const isChecked = e.target.checked
                    if (isChecked) {
                        setIsSelectedAll(true)
                        setSelectedRowKeys(data.map((row) => row?._id))
                    } else {
                        setIsSelectedAll(false)
                        setSelectedRowKeys([])
                    }
                }}
            />
        ),

        renderCell: (checked, record) => {
            return (
                <span>
                    <Checkbox
                        checked={
                            selectedRowKeys?.includes(record?._id) || false
                        }
                        onChange={(e) => {
                            const isChecked = e.target.checked
                            if (isChecked) {
                                setSelectedRowKeys([
                                    ...selectedRowKeys,
                                    record._id,
                                ])
                            } else {
                                setSelectedRowKeys(
                                    selectedRowKeys.filter(
                                        (key) => key !== record._id
                                    )
                                )
                            }
                        }}
                    />
                </span>
            )
        },
    }
    return (
        <>
            <Table
                columns={tableHeaders}
                dataSource={data ? data : []}
                loading={isLoading || loading}
                onChange={handleTableChange}
                showSizeChanger={false}
                rowKey={(record) => record.id}
                rowSelection={
                    isRowSelection && {
                        type: 'checkbox',
                        ...rowSelection,
                    }
                }
                {...props}
            />
            {/* <div className="w-full my-6 flex justify-center">
                <Pagination
                    current={page}
                    total={totalCount}
                    defaultCurrent={1}
                    onChange={onChange}
                    pageSize={pageSize}
                />
            </div> */}
        </>
    )
}
