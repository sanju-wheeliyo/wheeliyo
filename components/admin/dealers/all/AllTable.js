'use client'
import React from 'react'
import { Divider, Space, Table, Tag } from 'antd'
// import { Divider, Table } from 'antd';
// import React, { useState } from 'react';

export default function AllTable({ tagcontent }) {
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
    ]

    const data = [
        {
            key: '0',
            dealerName: 'Jorden Hodge',
            email: <span>Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
        },

        {
            key: '0',
            dealerName: 'Jorden Hodge',
            email: <span>Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
        },

        {
            key: '0',
            dealerName: 'Jorden Hodge',
            email: <span>Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
        },

        {
            key: '0',
            dealerName: 'Jorden Hodge',
            email: <span>Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
        },

        {
            key: '0',
            dealerName: 'Jorden Hodge',
            email: <span>Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
        },

        {
            key: '0',
            dealerName: 'Jorden Hodge',
            email: <span>Jordenodge@gmail.com</span>,
            phone: '+91 98765 4210',
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
