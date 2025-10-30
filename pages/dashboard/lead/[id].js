'use client'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Modal } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import UserLayout from 'components/layouts/UserLayout'
import UserContext from 'lib/context/UserContext'
import { getLeadDetails } from 'lib/services/leads.services'
import useApi from 'lib/hooks/useApi'
import Loader from 'components/display/Loader'
import useToast from 'lib/hooks/useToast'
import {
    FileImage,
    formatDateDDMMYYYY,
    formatDateDDMMYYYYTime,
} from 'lib/utils/helper'

export default function LeadDetailsPage() {
    const router = useRouter()
    const { id } = router.query
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [activeTab, setActiveTab] = useState('Owner info')
    const [lead, setLead] = useState(null)
    const [loading, setLoading] = useState(true)
    const API_getLeadDetails = useApi(getLeadDetails)

    useEffect(() => {
        if (id) {
            fetchLeadDetails()
        }
    }, [id])

    useEffect(() => {
        if (lead) {
            setHeader(
                `${lead?.brand?.name || 'Vehicle details'} ${
                    lead?.model?.name ? `- ${lead?.model?.name}` : ''
                }`
            )
            setHeaderIcon('/assets/common/sidenav/leadsMenuIconGray.svg')
        }
    }, [lead, setHeader, setHeaderIcon])

    const fetchLeadDetails = async () => {
        try {
            setLoading(true)
            const res = await API_getLeadDetails.request(id)
            if (res?.data?.data) {
                setLead(res.data.data[0] || res.data.data)
            }
        } catch (error) {
            console.error('Error fetching lead details:', error)
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { title: 'Owner info', key: 'Owner info' },
        { title: 'Vehicle info', key: 'Vehicle info' },
        { title: 'Documents', key: 'Documents' },
        { title: 'Auction info', key: 'Auction info' },
    ]

    if (loading) {
        return (
            <UserLayout>
                <div className="flex justify-center items-center py-12">
                    <Loader />
                </div>
            </UserLayout>
        )
    }

    if (!lead) {
        return (
            <UserLayout>
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Lead not found
                    </h3>
                    <p className="text-gray-500">
                        The lead you're looking for doesn't exist or has been
                        removed.
                    </p>
                </div>
            </UserLayout>
        )
    }

    // Use signed URL from API if available, otherwise fallback to direct S3 URL or placeholder
    const image =
        lead?.image_key_signed_url ||
        (lead?.image_key
            ? FileImage(lead.image_key)
            : '/assets/leads/car-one.png')
    const isAuction = lead?.car_type === 'auction'

    return (
        <UserLayout>
            <div className="w-full">
                <div className="w-full bg-white rounded-2xl p-6">
                    {/* Image Section */}
                    <div className="mb-6">
                        <img
                            src={image}
                            alt={`${lead?.brand?.name || 'Car'} ${
                                lead?.model?.name || ''
                            }`}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="flex border-b border-gray-200">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                                        activeTab === tab.key
                                            ? 'border-pink-500 text-pink-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4">
                        {activeTab === 'Owner info' && (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Name:</span>
                                    <span className="font-medium">
                                        {lead?.owner?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Phone:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.owner?.phone || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Email:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.owner?.email || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Address:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.owner?.address || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Vehicle info' && (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Brand:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.brand?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Model:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.model?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Variant:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.variant?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Year of Manufacture:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.vehicle?.year_of_manufacture ||
                                            'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Registration State:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.vehicle?.registered_state ||
                                            'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Fuel Type:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.fuel_type?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Transmission:
                                    </span>
                                    <span className="font-medium">
                                        {lead?.transmission_type?.name || 'N/A'}
                                    </span>
                                </div>
                                {lead?.vehicle?.min_kilometers && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Kilometers:
                                        </span>
                                        <span className="font-medium">
                                            {lead.vehicle.min_kilometers} -{' '}
                                            {lead.vehicle.max_kilometers ||
                                                lead.vehicle
                                                    .min_kilometers}{' '}
                                            km
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Documents' && (
                            <DocumentsSection lead={lead} />
                        )}

                        {activeTab === 'Auction info' &&
                            isAuction &&
                            lead?.auction_details && (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Bank Name:
                                        </span>
                                        <span className="font-medium">
                                            {lead.auction_details.bank_name ||
                                                'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Location:
                                        </span>
                                        <span className="font-medium">
                                            {lead.auction_details.location ||
                                                'N/A'}
                                        </span>
                                    </div>
                                    {lead.auction_details.start_date && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Start Date:
                                            </span>
                                            <span className="font-medium">
                                                {formatDateDDMMYYYY(
                                                    lead.auction_details
                                                        .start_date
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {lead.auction_details.end_date && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                End Date:
                                            </span>
                                            <span className="font-medium">
                                                {formatDateDDMMYYYY(
                                                    lead.auction_details
                                                        .end_date
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {lead.auction_details.emd_amount && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                EMD Amount:
                                            </span>
                                            <span className="font-medium">
                                                ₹
                                                {
                                                    lead.auction_details
                                                        .emd_amount
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {lead.auction_details.reserve_price && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Reserve Price:
                                            </span>
                                            <span className="font-medium">
                                                ₹
                                                {
                                                    lead.auction_details
                                                        .reserve_price
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                        {activeTab === 'Auction info' && !isAuction && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    This is not an auction vehicle. No auction
                                    information available.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Back Button */}
                    <div className="mt-8">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                            ← Back to Leads
                        </button>
                    </div>
                </div>
            </div>
        </UserLayout>
    )
}

function DocumentsSection({ lead }) {
    const [previewDoc, setPreviewDoc] = useState(null)
    const [showRejectReason, setShowRejectReason] = useState(false)
    const [rejectionReasons, setRejectionReasons] = useState({})
    const { success, error } = useToast()

    const documentTypes = [
        { key: 'rc', label: 'Registration Certificate', type: 'pdf' },
        { key: 'puc', label: 'PUC Certificate', type: 'pdf' },
        { key: 'insurance', label: 'Insurance Document', type: 'pdf' },
        { key: 'car_front', label: 'Car Front View', type: 'image' },
        { key: 'car_back', label: 'Car Back View', type: 'image' },
        { key: 'car_left', label: 'Car Left View', type: 'image' },
        { key: 'car_right', label: 'Car Right View', type: 'image' },
        { key: 'car_interior_front', label: 'Interior Front', type: 'image' },
        { key: 'car_interior_back', label: 'Interior Back', type: 'image' },
        { key: 'car_frontside_left', label: 'Front Left Angle', type: 'image' },
        {
            key: 'car_frontside_right',
            label: 'Front Right Angle',
            type: 'image',
        },
        { key: 'car_backside_right', label: 'Back Right Angle', type: 'image' },
        { key: 'car_backside_left', label: 'Back Left Angle', type: 'image' },
        { key: 'odometer', label: 'Odometer Reading', type: 'image' },
        { key: 'service_history', label: 'Service History', type: 'pdf' },
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-600'
            case 'rejected':
                return 'text-red-500'
            case 'pending':
                return 'text-yellow-500'
            default:
                return 'text-gray-500'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <>
                        Verified <span className="ml-1">&#10003;</span>
                    </>
                )
            case 'rejected':
                return (
                    <>
                        Rejected <span className="ml-1">&#10005;</span>
                    </>
                )
            case 'pending':
                return 'Pending'
            default:
                return 'Not Uploaded'
        }
    }

    const handleDocumentPreview = (docType) => {
        if (lead?.documents?.[docType]) {
            setPreviewDoc(docType)
        }
    }

    const getDocumentUrl = (docType) => {
        return `/api/lead/document/${docType}?leadId=${lead._id}&type=${docType}`
    }

    const updateRejectionReason = (key, value) => {
        setRejectionReasons((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleDocAction = async (docType, action) => {
        try {
            // Here you would call your API to update document status
            // For now, we'll just show a success message
            if (action === 'approved') {
                success(
                    `${
                        documentTypes.find((d) => d.key === docType)?.label
                    } approved successfully!`
                )
            } else if (action === 'rejected') {
                success(
                    `${
                        documentTypes.find((d) => d.key === docType)?.label
                    } rejected!`
                )
            }
            setPreviewDoc(null)
            setShowRejectReason(false)
            updateRejectionReason(docType, '')
        } catch (err) {
            error('Failed to update document status')
        }
    }

    return (
        <>
            <div className="w-full space-y-4">
                <div className="w-full flex flex-col gap-4">
                    {documentTypes.map((doc) => {
                        const document = lead?.documents?.[doc.key]
                        const isUploaded =
                            document &&
                            (document.data || document.s3Key || document.status)
                        const status = document?.status || 'not_uploaded'

                        return (
                            <div
                                key={doc.key}
                                className="flex items-center w-full mb-4"
                            >
                                {/* Card - 70% */}
                                <div className="flex items-center gap-4 bg-white rounded-xl shadow p-4 w-[70%] justify-between">
                                    <img
                                        src="/assets/common/sidenav/documents-color.svg"
                                        alt="Document Icon"
                                        className="w-8 h-8"
                                    />
                                    <div className="font-semibold flex items-center justify-between w-full">
                                        <span>{doc.label}</span>
                                        {isUploaded && (
                                            <EyeOutlined
                                                className="cursor-pointer text-xl text-blue-500 hover:text-blue-700"
                                                onClick={() =>
                                                    handleDocumentPreview(
                                                        doc.key
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                {/* Status - 30% */}
                                <div className="ml-4 text-sm font-semibold flex items-center w-[30%]">
                                    <span className={getStatusColor(status)}>
                                        {getStatusText(status)}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {lead?.documentStatus && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                                Overall Document Status:
                            </span>
                            <span
                                className={`text-sm font-semibold ${getStatusColor(
                                    lead.documentStatus
                                )}`}
                            >
                                {getStatusText(lead.documentStatus)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Document Preview Modal */}
            <Modal
                open={!!previewDoc}
                onCancel={() => {
                    setPreviewDoc(null)
                    setShowRejectReason(false)
                    updateRejectionReason(previewDoc, '')
                }}
                footer={null}
                centered
                closable={false}
                title={
                    <div className="w-full text-center font-semibold relative flex items-center justify-center">
                        <span
                            className="absolute left-0 cursor-pointer text-2xl"
                            onClick={() => {
                                setPreviewDoc(null)
                                setShowRejectReason(false)
                                updateRejectionReason(previewDoc, '')
                            }}
                        >
                            &lt;
                        </span>
                        {previewDoc
                            ? documentTypes.find((f) => f.key === previewDoc)
                                  ?.label
                            : ''}
                    </div>
                }
            >
                {previewDoc && lead?.documents?.[previewDoc] && (
                    <div className="flex flex-col items-center relative">
                        {lead.documents[previewDoc].data ||
                        lead.documents[previewDoc].s3Key ? (
                            // Document has actual data - show preview
                            documentTypes.find((f) => f.key === previewDoc)
                                ?.type === 'pdf' ? (
                                <div className="w-full h-[500px] flex flex-col bg-gray-100 rounded-lg mb-6">
                                    <div className="flex items-center p-3 bg-gray-200 rounded-t-lg">
                                        <div className="flex items-center">
                                            <div className="text-2xl mr-2">
                                                📄
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    PDF Document
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {lead.documents[previewDoc]
                                                        ?.originalName ||
                                                        'Document'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">
                                                    📄
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    PDF Preview
                                                </p>
                                                <p className="text-xs text-gray-500 mb-4">
                                                    {lead.documents[previewDoc]
                                                        ?.originalName ||
                                                        'Document'}
                                                </p>
                                                <a
                                                    href={getDocumentUrl(
                                                        previewDoc
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded px-4 py-2 inline-flex items-center"
                                                >
                                                    <span className="mr-2">
                                                        📥
                                                    </span>{' '}
                                                    Open PDF in New Tab
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={getDocumentUrl(previewDoc)}
                                    alt={previewDoc}
                                    className="max-w-[400px] max-h-[300px] w-auto h-auto object-contain mb-6 mx-auto bg-gray-100 rounded"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.nextSibling.style.display =
                                            'block'
                                    }}
                                />
                            )
                        ) : (
                            // Document has status but no data - show placeholder
                            <div className="w-full h-[500px] flex flex-col items-center justify-center bg-gray-100 rounded-lg mb-6">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📄</div>
                                    <p className="text-lg font-semibold mb-2">
                                        Document Pending
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        This document has been marked as pending
                                        but the file hasn't been uploaded yet.
                                    </p>
                                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                                        Status:{' '}
                                        {lead.documents[previewDoc]?.status ||
                                            'Not Uploaded'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Buttons */}
                        <div className="flex gap-4 justify-center mt-4">
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-2 flex items-center border-none outline-none"
                                onClick={() =>
                                    handleDocAction(previewDoc, 'approved')
                                }
                                type="button"
                            >
                                <span className="mr-2">&#10003;</span> Verify
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full px-6 py-2 flex items-center border-none outline-none"
                                onClick={() => setShowRejectReason(true)}
                                type="button"
                            >
                                <span className="mr-2">&#10005;</span> Reject
                            </button>
                        </div>

                        {/* Rejection Reason Input */}
                        {showRejectReason && (
                            <div className="w-full flex flex-col items-center mt-4">
                                <textarea
                                    rows={2}
                                    className="mb-2 w-64 p-2 border border-gray-300 rounded"
                                    placeholder="Rejection reason *"
                                    value={rejectionReasons[previewDoc] || ''}
                                    onChange={(e) =>
                                        updateRejectionReason(
                                            previewDoc,
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full px-6 py-2 flex items-center border-none outline-none"
                                    onClick={() => {
                                        handleDocAction(previewDoc, 'rejected')
                                        setShowRejectReason(false)
                                        updateRejectionReason(previewDoc, '')
                                    }}
                                    type="button"
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    )
}
