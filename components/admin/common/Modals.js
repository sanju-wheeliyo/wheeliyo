
'use client';
import React, { children, useState} from 'react';
import { Modal } from 'antd';



export default function Modals({ isOpen, onClose, children }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleOk = () => {
    setIsModalOpen(false)
}
const handleCancel = () => {
    setIsModalOpen(false)
}
console.log
  return (
    <>
      <Modal>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        
      </Modal>
    </>
  );
}
