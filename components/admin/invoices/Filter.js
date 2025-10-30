
'use client';
import React, { useState } from 'react';
import { Button, Checkbox, Input, Modal } from 'antd';
import Search from '../common/Search';

export default function Filter({placeholder}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
    <div className="w-full pt-4">
            <ul className="w-full flex flex-wrap">
              <li className="w-1/6 p-2">
                <Search placeholder="Search"/>
              </li>
            </ul>
          </div>
    </>
  );
}
