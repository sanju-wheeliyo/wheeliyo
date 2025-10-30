'use client'
import React from 'react'
import { Divider, Space, Table, Tag } from 'antd'
// import { Divider, Table } from 'antd';
// import React, { useState } from 'react';

export default function DealerTable({ tagcontent }) {
    // const [selectionType, setSelectionType] = useState(' ');

    const columns = [
        {
            title: 'Dealer Name',
            dataIndex: 'dealerName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Phone number',
            dataIndex: 'phone',
        },
        {
            title: 'Starting date',
            dataIndex: 'starting',
        },
        {
            title: 'Ending date',
            dataIndex: 'ending',
        },
        {
            title: 'links',
            dataIndex: 'links',
        },
    ]

    const data = [
        {
            key: '0',
            dealerName: 'Jorden Hodge',
            email: <span className="underline">Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
            starting: '20/05/2024',
            ending: '20/07/2024',
            links: (
                <span className="underline text-[#0648AA]">View invoice</span>
            ),
        },
        {
            key: '1',
            dealerName: 'Jorden Hodge',
            email: <span className="underline">Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
            starting: '20/05/2024',
            ending: '20/07/2024',
            links: (
                <span className="underline text-[#0648AA]">View invoice</span>
            ),
        },
        {
            key: '2',
            dealerName: 'Jorden Hodge',
            email: <span className="underline">Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
            starting: '20/05/2024',
            ending: '20/07/2024',
            links: (
                <span className="underline text-[#0648AA]">View invoice</span>
            ),
        },
        {
            key: '3',
            dealerName: 'Jorden Hodge',
            email: <span className="underline">Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
            starting: '20/05/2024',
            ending: '20/07/2024',
            links: (
                <span className="underline text-[#0648AA]">View invoice</span>
            ),
        },
        {
            key: '4',
            dealerName: 'Jorden Hodge',
            email: <span className="underline">Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
            starting: '20/05/2024',
            ending: '20/07/2024',
            links: (
                <span className="underline text-[#0648AA]">View invoice</span>
            ),
        },
        {
            key: '5',
            dealerName: 'Jorden Hodge',
            email: <span className="underline">Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
            starting: '20/05/2024',
            ending: '20/07/2024',
            links: (
                <span className="underline text-[#0648AA]">View invoice</span>
            ),
        },
        {
            key: '6',
            dealerName: 'Jorden Hodge',
            email: <span className="underline">Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
            starting: '20/05/2024',
            ending: '20/07/2024',
            links: (
                <span className="underline text-[#0648AA]">View invoice</span>
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
    // const columns = [
    //   {
    //     title: 'Name',
    //     dataIndex: 'name',
    //     key: 'name',
    //     render: (text) => <a>{text}</a>,
    //   },
    //   {
    //     title: 'Age',
    //     dataIndex: 'age',
    //     key: 'age',
    //   },
    //   {
    //     title: 'Address',
    //     dataIndex: 'address',
    //     key: 'address',
    //   },
    //   {
    //     title: 'Tags',
    //     key: 'tags',
    //     dataIndex: 'tags',
    //   },
    //   {
    //     title: 'Action',
    //     key: 'action',
    //     dataIndex: 'action',
    //   },
    // ];
    // const data = [
    //   {
    //     key: '1',
    //     name: 'John Brown',
    //     age: 32,
    //     address: 'New York No. 1 Lake Park',
    //     tags: ['nice', 'developer'],
    //   },
    //   {
    //     key: '2',
    //     name: 'Jim Green',
    //     age: 42,
    //     address: 'London No. 1 Lake Park',
    //     tags: ['loser'],
    //   },
    //   {
    //     key: '3',
    //     name: 'Joe Black',
    //     age: 32,
    //     address: 'Sydney No. 1 Lake Park',
    //     tags: ['cool', 'teacher'],
    //   },
    // ];

    return (
        <>
            <Divider />
            <Table columns={columns} dataSource={data} />
        </>
    )
}
