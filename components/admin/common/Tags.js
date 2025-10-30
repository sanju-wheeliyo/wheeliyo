'use client'
import React from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';



export default function Tags({tagcontent}) {
    const preventDefault = (e) => {
        e.preventDefault();
        console.log('Clicked! But prevent default.');
      };
    return (
        <>
            <Tag className="w-auto px-8 py-1 border border-solid border-[#D01768] text-[#D01768] rounded-full bg-[#ffffff] text-center">{tagcontent}</Tag>
        </>
    )
}
