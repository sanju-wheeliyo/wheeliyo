import React, { useState, useEffect } from 'react'
import AdminLayout from 'components/layouts/AdminLayout'
import Table from 'antd/lib/table'
import Button from 'components/input/Button'
import { Tabs, Spin, Alert } from 'antd'
import axios from 'axios'
import KYCModal from 'components/modals/KYCModal'

const columnsBase = (onView) => [
    {
        title: 'S.No',
        key: 'serialNumber',
        width: 80,
        render: (_, __, index) => index + 1,
    },
    { title: 'User Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    {
        title: 'KYC Status',
        dataIndex: 'is_KYC_verified',
        key: 'is_KYC_verified',
        render: (status) => {
            if (!status || typeof status !== 'string')
                return <span className="text-gray-400">N/A</span>
            return (
                <span
                    className={
                        status === 'pending'
                            ? 'text-yellow-500'
                            : status === 'approved'
                                ? 'text-green-600'
                                : status === 'rejected'
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                    }
                >
                    {status.charAt(0).toUpperCase() +
                        status.slice(1).replace('_', ' ')}
                </span>
            )
        },
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Button
                type="primary"
                className="btn-gradient rounded"
                onClick={() => onView(record)}
            >
                View KYC
            </Button>
        ),
    },
]

export default function KYCApprovalPage() {
    const [filters, setFilters] = useState({ search: '' })
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [modalUser, setModalUser] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        showSizeChanger: false,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        total: 0,
    })
    const [activeTab, setActiveTab] = useState('notApproved')

    const fetchData = async (page = 1, tab = activeTab, search = filters.search) => {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem('accessToken')
        try {
            const res = await axios.get('/api/admin/dealers/get_all', {
                headers: { Authorization: `Bearer ${token}` },
                params: { 
                    page,
                    size: pagination.pageSize,
                    search: search || undefined
                }
            })
            
            let users = Array.isArray(res.data.data)
                ? res.data.data
                : [res.data.data]
            
            // Filter based on active tab
            const filteredUsers = tab === 'approved' 
                ? users.filter(item => item.is_KYC_verified === 'approved')
                : users.filter(item => item.is_KYC_verified !== 'approved')
            
            setData(filteredUsers)
            
            // Update pagination with metadata from response
            if (res.data.meta) {
                const { totalCount, totalPages, page: currentPage } = res.data.meta
                setPagination(prev => ({
                    ...prev,
                    current: currentPage,
                    total: totalCount,
                    totalPages
                }))
            }
        } catch (err) {
            console.error('[KYC] Fetch error:', err)
            if (err.response) {
                console.error('[KYC] Error response:', err.response)
            }
            if (err.message) {
                console.error('[KYC] Error message:', err.message)
            }
            setError('Failed to fetch KYC data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(1, activeTab, filters.search)
    }, [activeTab])

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData(1, activeTab, filters.search)
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [filters.search])

    const handleView = (user) => {
        setModalUser(user)
        setModalOpen(true)
    }

    const handleModalClose = () => {
        setModalUser(null)
        setModalOpen(false)
    }

    const handleTableChange = (paginationInfo) => {
        setPagination(prev => ({
            ...prev,
            current: paginationInfo.current,
        }))
        fetchData(paginationInfo.current, activeTab, filters.search)
    }

    const handleTabChange = (key) => {
        setActiveTab(key)
        setPagination(prev => ({
            ...prev,
            current: 1
        }))
    }

    return (
        <AdminLayout>
            <div className="w-full pt-4">
                <ul className="w-full flex flex-wrap">
                    <li className="w-full sm:w-1/2 md:w-1/3 xl:w-1/4 p-2 !pl-0 pr-0 sm:pr-2">
                        <input
                            className="w-full border rounded px-3 py-2"
                            placeholder="Search by name, phone, or city"
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    search: e.target.value,
                                })
                            }
                        />
                    </li>
                </ul>
            </div>
            <div className="w-full mt-4">
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Alert type="error" message={error} />
                ) : (
                    <Tabs defaultActiveKey="notApproved" onChange={handleTabChange}>
                        <Tabs.TabPane tab="Not Approved KYC" key="notApproved">
                            <Table
                                columns={columnsBase(handleView)}
                                dataSource={data}
                                rowKey="id"
                                pagination={pagination}
                                onChange={handleTableChange}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Approved KYC" key="approved">
                            <Table
                                columns={columnsBase(handleView)}
                                dataSource={data}
                                rowKey="id"
                                pagination={pagination}
                                onChange={handleTableChange}
                            />
                        </Tabs.TabPane>
                    </Tabs>
                )}
                <KYCModal
                    open={modalOpen}
                    user={modalUser}
                    onClose={handleModalClose}
                />
            </div>
        </AdminLayout>
    )
}
