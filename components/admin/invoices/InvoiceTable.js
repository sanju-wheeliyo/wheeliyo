'use client'
import React from 'react'
import { Divider, Space, Table, Tag } from 'antd'
// import { Divider, Table } from 'antd';
// import React, { useState } from 'react';

export default function InvoiceTable({ tagcontent }) {
    // const [selectionType, setSelectionType] = useState(' ');

    const columns = [
        {
            title: 'Sl No',
            dataIndex: 'slNo',
        },
        {
            title: 'Dealer',
            dataIndex: 'dealer',
        },
        {
            title: 'Date',
            dataIndex: 'date',
        },
        {
            title: 'Invoice ID',
            dataIndex: 'invoiceId',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
        },
        {
            title: ' ',
            dataIndex: 'downloads',
        },
    ]

    const data = [
        {
            key: '0',
            slNo: '01',
            dealer: 'Samson thomas',
            date: '21/03/2024',
            invoiceId: '013BHG76GHH',
            amount: '₹7200.00',
            status: 'Paid',
            downloads: (
                <span className="flex items-center">
                    <span className="w-4 h-4 block">
                        <img
                            className="w-full"
                            src="/assets/common/download.png"
                        />
                    </span>
                    <span className="pl-2 block">Download</span>
                </span>
            ),
        },
        {
            key: '0',
            slNo: '01',
            dealer: 'Samson thomas',
            date: '21/03/2024',
            invoiceId: '013BHG76GHH',
            amount: '₹7200.00',
            status: 'Paid',
            downloads: (
                <span className="flex items-center">
                    <span className="w-4 h-4 block">
                        <img
                            className="w-full"
                            src="/assets/common/download.png"
                        />
                    </span>
                    <span className="pl-2 block">Download</span>
                </span>
            ),
        },
        {
            key: '0',
            slNo: '01',
            dealer: 'Samson thomas',
            date: '21/03/2024',
            invoiceId: '013BHG76GHH',
            amount: '₹7200.00',
            status: 'Paid',
            downloads: (
                <span className="flex items-center">
                    <span className="w-4 h-4 block">
                        <img
                            className="w-full"
                            src="/assets/common/download.png"
                        />
                    </span>
                    <span className="pl-2 block">Download</span>
                </span>
            ),
        },
        {
            key: '0',
            slNo: '01',
            dealer: 'Samson thomas',
            date: '21/03/2024',
            invoiceId: '013BHG76GHH',
            amount: '₹7200.00',
            status: 'Paid',
            downloads: (
                <span className="flex items-center">
                    <span className="w-4 h-4 block">
                        <img
                            className="w-full"
                            src="/assets/common/download.png"
                        />
                    </span>
                    <span className="pl-2 block">Download</span>
                </span>
            ),
        },
        {
            key: '0',
            slNo: '01',
            dealer: 'Samson thomas',
            date: '21/03/2024',
            invoiceId: '013BHG76GHH',
            amount: '₹7200.00',
            status: 'Paid',
            downloads: (
                <span className="flex items-center">
                    <span className="w-4 h-4 block">
                        <img
                            className="w-full"
                            src="/assets/common/download.png"
                        />
                    </span>
                    <span className="pl-2 block">Download</span>
                </span>
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
            <Table columns={columns} dataSource={data} />
        </>
    )
}
