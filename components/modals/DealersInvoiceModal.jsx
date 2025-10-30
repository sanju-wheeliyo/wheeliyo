import { Modal } from 'antd'
import Image from 'next/image'
import InvoicesApi from 'lib/services/invoices.services'
import { userInvoice } from 'lib/services/userinvoice.services'
import useApi from 'lib/hooks/useApi'
import ListingContextProvider from 'lib/hooks/ListingContextProvider'
import Listing from 'lib/utils/Listing'
import { formatDateDDMMYYYY } from 'lib/utils/helper'
import { useState } from 'react'

const DealersInvoiceModal = ({
    userId,
    isModalOpen,
    handleOk,
    handleCancel,
    invoiceData, // Add this prop to receive invoice data directly
}) => {
    return (
        <Modal
            title={
                <span className="flex justify-center w-full text-lg">
                    Invoice Details
                </span>
            }
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={false}
            className="relative"
        // centered
        >
            <div className="p-4">
                {invoiceData ? (
                    <InvoiceCard item={invoiceData} />
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        No invoice data available
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default DealersInvoiceModal

function InvoiceCard({ item }) {
    // Helper function to format amount to fixed decimal places
    const formatToFixed = (amount) => {
        if (!amount) return '0.00';
        return parseFloat(amount).toFixed(2);
    };

    // Helper function to format date to DD/MM/YYYY
    const formatDateDDMMYYYY = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Get the first active subscription for display
    const subscription = item?.activeSubscriptions?.[0];
    
    // Calculate duration in months
    const getDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Calculate months difference
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        
        // Calculate remaining days
        const startDay = start.getDate();
        const endDay = end.getDate();
        let remainingDays = endDay - startDay;
        
        // Adjust for month boundaries
        if (remainingDays < 0) {
            const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            remainingDays += lastMonth.getDate();
        }
        
        if (months === 0) {
            return `${remainingDays} days`;
        } else if (remainingDays === 0) {
            return months === 1 ? '1 month' : `${months} months`;
        } else {
            return months === 1 ? `1 month ${remainingDays} days` : `${months} months ${remainingDays} days`;
        }
    };

    return (
        <div className="bg-white block w-full max-w-md mx-auto font-mono text-sm">
            {/* Receipt Header */}
            <div className="text-center border-b-2 border-black pb-2 mb-4">
                <h1 className="text-lg font-bold text-black mb-1">WHEELIYO</h1>
                <p className="text-xs text-gray-600 mb-1">Premium Subscription Service</p>
            </div>

            {/* Customer Information */}
            <div className="mb-4">
                <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                    <p className="text-xs text-gray-600">CUSTOMER INFO</p>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Name:</span>
                        <span className="text-xs font-semibold">{item?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Phone:</span>
                        <span className="text-xs font-semibold">{item?.phone || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="mb-4">
                <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                    <p className="text-xs text-gray-600">SUBSCRIPTION DETAILS</p>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Invoice ID:</span>
                        <span className="text-xs font-semibold">{subscription?.payment_id || subscription?._id || item?._id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Start Date:</span>
                        <span className="text-xs font-semibold">{formatDateDDMMYYYY(subscription?.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">End Date:</span>
                        <span className="text-xs font-semibold">{formatDateDDMMYYYY(subscription?.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Duration:</span>
                        <span className="text-xs font-semibold">{getDuration(subscription?.start_date, subscription?.end_date)}</span>
                    </div>
                </div>
            </div>

            {/* Item Details */}
            <div className="mb-4">
                <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                    <p className="text-xs text-gray-600">PLAN DETAILS</p>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Plan Type:</span>
                        <span className="text-xs font-semibold">{subscription?.plan_details?.type || 'Premium'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Plan Amount:</span>
                        <span className="text-xs font-semibold">₹{formatToFixed(subscription?.plan_details?.amount || subscription?.amount || 0)}</span>
                    </div>
                </div>
            </div>

            {/* Totals Section */}
            <div className="mb-4">
                <div className="border-t-2 border-black pt-2">
                    <div className="flex justify-between text-sm font-bold">
                        <span>TOTAL</span>
                        <span>₹{formatToFixed(subscription?.plan_details?.amount || subscription?.amount || 0)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
