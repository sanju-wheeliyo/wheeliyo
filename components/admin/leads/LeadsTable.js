'use client'
import { Divider, Modal, Table, Tabs } from 'antd'
import React, { useState } from 'react'
import Tags from '../common/Tags'

export default function LeadsTable({ content }) {
    const [selectionType, setSelectionType] = useState('checkbox')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)
    const items = [
        {
            key: '1',
            label: 'Owner info',
            children: (
                <div className="w-full relative">
                    <span className="block absolute left-0 -top-32">
                        <Tags className="bg-gradient" tagcontent="Bank Auction">
                            Bank Auction
                        </Tags>
                    </span>
                    <table className="w-full">
                        <tr>
                            <td>Name</td>
                            <td>: Samson Thomson</td>
                        </tr>
                        <tr>
                            <td>Contact</td>
                            <td>: 987654321</td>
                        </tr>
                    </table>
                    <div className="w-full flex justify-end">
                        <ul className="flex">
                            <li className="px-3">
                                <span className="block w-5 cursor-pointer">
                                    <img
                                        className="w-full"
                                        src="/assets/common/delete-gradient.svg"
                                    />
                                </span>
                            </li>
                            <li className="px-3">
                                <span className="block w-5 cursor-pointer">
                                    <img
                                        className="w-full"
                                        src="/assets/common/edit-gradient.svg"
                                    />
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            key: '2',
            label: 'Vehicle info',
            children: (
                <table className="w-full">
                    <tr>
                        <td>Vehicle number</td>
                        <td>: KL45WR7 </td>
                    </tr>
                    <tr>
                        <td>Brand</td>
                        <td>: Toyota</td>
                    </tr>
                    <tr>
                        <td>Model</td>
                        <td>: Legender</td>
                    </tr>
                    <tr>
                        <td>Variant</td>
                        <td>: Toyota Fortuner 2.8L Legender 4X2 ATAccess</td>
                    </tr>
                    <tr>
                        <td>Year</td>
                        <td>: 2020</td>
                    </tr>
                    <tr>
                        <td>Registered state</td>
                        <td>: Gujarat</td>
                    </tr>
                    <tr>
                        <td>Fuel type</td>
                        <td>: Petrol</td>
                    </tr>
                    <tr>
                        <td>Transmission type</td>
                        <td>: Automatic</td>
                    </tr>
                    <tr>
                        <td>Kms driven</td>
                        <td>: 20,001-30,000 Kms driven</td>
                    </tr>
                </table>
            ),
        },
        {
            key: '3',
            label: 'Auction info',
            children: (
                <table className="w-full">
                    <tr>
                        <td>Bank name</td>
                        <td>: Catholic syrian bank ltd</td>
                    </tr>
                    <tr>
                        <td>Auction start date</td>
                        <td>: 22/05/2024</td>
                    </tr>
                    <tr>
                        <td>Auction end date</td>
                        <td>: 22/05/2024</td>
                    </tr>
                    <tr>
                        <td>Auction location</td>
                        <td>: Kochi, Kerala, India</td>
                    </tr>
                    <tr>
                        <td>Reserve price</td>
                        <td>: 7000/-</td>
                    </tr>
                    <tr>
                        <td>EMD Amount</td>
                        <td>: 1234/-</td>
                    </tr>
                    <tr>
                        <td>EMD submission date and time</td>
                        <td>: 20/05/2024 & 03:45 PM</td>
                    </tr>
                    <tr>
                        <td>Reserve price</td>
                        <td>: 7000/-</td>
                    </tr>
                    <tr>
                        <td>Inspection date</td>
                        <td>: 22/05/2024</td>
                    </tr>
                    <tr>
                        <td>Notes</td>
                        <td>
                            : Inspection offered on Saturday before
                            auction.Auctioneer charges 10%
                        </td>
                    </tr>
                </table>
            ),
        },
    ]

    const columns = [
        {
            title: 'Share contact',
            dataIndex: 'name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Owner Name',
            dataIndex: 'age',
        },
        {
            title: 'Contact number',
            dataIndex: 'address',
        },
        {
            title: 'Brand & Model',
            dataIndex: 'address',
        },
        {
            title: 'State & Year',
            dataIndex: 'stateYear',
        },
        {
            title: 'Variant',
            dataIndex: 'variant',
        },
        {
            title: 'Kms driven',
            dataIndex: 'kms',
        },
        {
            title: 'Type',
            dataIndex: 'type',
        },
        {
            title: 'Action',
            dataIndex: 'action',
        },
    ]

    const data = [
        {
            key: '0',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            stateYear: 'Kerala-2020',
            variant: ' Legender 4X2  , ATAccess ',
            kms: '  20,001-30,000 kms',
            type: <Tags tagcontent="Bank Auction">Bank Auction</Tags>,
            action: (
                <ul className="flex">
                    <li className="px-3">
                        <span className="block w-5 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/delete-gradient.svg"
                            />
                        </span>
                    </li>
                    <li className="px-3">
                        <span className="block w-5 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/edit-gradient.svg"
                            />
                        </span>
                    </li>
                </ul>
            ),
        },
        {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            stateYear: 'Kerala-2020',
            variant: ' Legender 4X2  , ATAccess ',
            kms: '  20,001-30,000 kms',
            type: <Tags tagcontent="Bank Auction">Bank Auction</Tags>,
            action: (
                <ul className="flex">
                    <li className="px-3">
                        <span className="block w-5 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/delete-gradient.svg"
                            />
                        </span>
                    </li>
                    <li className="px-3">
                        <span className="block w-5 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/edit-gradient.svg"
                            />
                        </span>
                    </li>
                </ul>
            ),
        },
        {
            key: '2',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            stateYear: 'Kerala-2020',
            variant: ' Legender 4X2  , ATAccess ',
            kms: '  20,001-30,000 kms',
            type: <Tags tagcontent="Bank Auction">Bank Auction</Tags>,
            action: (
                <ul className="flex">
                    <li className="px-3">
                        <span className="block w-5 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/delete-gradient.svg"
                            />
                        </span>
                    </li>
                    <li className="px-3">
                        <span className="block w-5 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/edit-gradient.svg"
                            />
                        </span>
                    </li>
                </ul>
            ),
        },
        {
            key: '3',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            stateYear: 'Kerala-2020',
            variant: ' Legender 4X2  , ATAccess ',
            kms: '  20,001-30,000 kms',
            type: <Tags tagcontent="Bank Auction">Bank Auction</Tags>,
            action: (
                <ul className="flex">
                    <li className="px-3">
                        <span className="block w-5 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/delete-gradient.svg"
                            />
                        </span>
                    </li>
                    <li className="px-3">
                        <span
                            onClick={openModal}
                            className="block w-5 cursor-pointer"
                        >
                            <img
                                className="w-full"
                                src="/assets/common/edit-gradient.svg"
                            />
                        </span>
                    </li>
                </ul>
            ),
        },
        {
            key: '4',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            stateYear: 'Kerala-2020',
            variant: ' Legender 4X2  , ATAccess ',
            kms: '  20,001-30,000 kms',
            type: <Tags tagcontent="Bank Auction">Bank Auction</Tags>,
            action: (
                <ul className="flex">
                    <li className="px-3">
                        <span className="block w-5 cursor-pointer">
                            <img
                                className="w-full"
                                src="/assets/common/delete-gradient.svg"
                            />
                        </span>
                    </li>
                    <li className="px-3">
                        <span
                            onClose={closeModal}
                            className="block w-5 cursor-pointer"
                        >
                            <img
                                className="w-full"
                                src="/assets/common/edit-gradient.svg"
                            />
                        </span>
                    </li>
                </ul>
            ),
        },
    ]

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(
                `selectedRowKeys: ${selectedRowKeys}`,
                'selectedRows: ',
                selectedRows
            )
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User',
            name: record.name,
        }),
    }

    return (
        <>
            <Divider />
            <Table
                rowSelection={{
                    type: selectionType,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={data}
            />
        </>
    )
}
