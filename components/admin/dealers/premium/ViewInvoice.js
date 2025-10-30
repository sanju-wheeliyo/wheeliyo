import DealersInvoiceModal from 'components/modals/DealersInvoiceModal'
import React, { useState } from 'react'

export default function ViewInvoice({ item }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="w-full">
            {/* View Invoice Button */}
            <span
                onClick={() => setIsModalOpen(true)}
                className="text-[#0648AA] cursor-pointer font-[600] text-[14px] hover:text-[#053a8a] transition-colors"
            >
                View invoice
            </span>
            
            <DealersInvoiceModal
                userId={item?._id}
                invoiceData={item}
                isModalOpen={isModalOpen}
                handleOk={() => setIsModalOpen(false)}
                handleCancel={() => setIsModalOpen(false)}
            />
        </div>
    )
}
