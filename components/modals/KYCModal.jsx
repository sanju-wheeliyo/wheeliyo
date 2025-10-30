import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, message, Spin } from 'antd'
import axios from 'axios'
import { FileImage } from 'lib/utils/helper'
import { EyeOutlined } from '@ant-design/icons';

const docFields = [
    { key: 'aadhar_front', label: 'Aadhar Front' },
    { key: 'aadhar_back', label: 'Aadhar Back' },
]

export default function KYCModal({ open, user, onClose }) {
    const [docStatus, setDocStatus] = useState({})
    const [loadingDoc, setLoadingDoc] = useState({})
    const [previewDoc, setPreviewDoc] = useState(null)
    const [ownerKycStatus, setOwnerKycStatus] = useState(user?.kycStatus || null)
    const [docs, setDocs] = useState({})
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [showRejectReason, setShowRejectReason] = useState(false);
    const [showPhotoPreview, setShowPhotoPreview] = useState(false);

    // Helper to update rejection reason by document
    const updateRejectionReason = (key, value) => {
        setRejectionReasons(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    useEffect(() => {
        if (user?._id && open) {
            const token = localStorage.getItem('accessToken');
            axios.get(`/api/admin/user/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    const data = res.data.data;
                    setOwnerKycStatus(data.is_KYC_verified);
                    setDocs(data.documents);
                    setDocStatus({
                        aadhar_front: { status: data.documents.aadhar_front?.status },
                        aadhar_back: { status: data.documents.aadhar_back?.status },
                        photo: { status: data.documents.photo?.status }
                    });
                })
                .catch(() => {
                    setDocs({});
                    setDocStatus({});
                });
        }
    }, [user, open]);

    const handleDocAction = async (key, status) => {
        if (!user?._id) return

        // Validate rejection reason is provided when rejecting
        if (status === 'rejected') {
            const reason = rejectionReasons[key] || ''
            if (!reason.trim()) {
                message.error('Rejection reason is mandatory');
                return;
            }
        }

        setLoadingDoc((prev) => ({ ...prev, [key]: true }))
        try {
            const payload = {
                _id: user._id,
                document_type: key,
                status,
            }
            if (status === 'rejected') {
                const reason = rejectionReasons[key] || ''
                payload.rejectionReason = reason
                console.log(`${key} was rejected. Reason: ${reason}`);
            }
            const token = localStorage.getItem('accessToken')
            await axios.put('/api/admin/verify/verify-doc', payload, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setDocStatus((prev) => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    status,
                    rejectionReason: status === 'rejected' ? rejectionReasons[key] : '',
                },
            }))
            message.success(`Document ${status}`)
        } catch (err) {
            message.error('Failed to update document status')
        } finally {
            setLoadingDoc((prev) => ({ ...prev, [key]: false }))
        }
    }

    const handleReasonChange = (key, value) => {
        setDocStatus((prev) => ({
            ...prev,
            [key]: { ...prev[key], rejectionReason: value },
        }))
    }

    if (!user) return null

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={500}
        >
            <div className="w-full flex flex-col items-center">
                {/* KYC Documents Section - now at the top */}
                <h2 className="text-lg font-bold mb-4"> KYC Documents</h2>
                <div className="w-full flex flex-col items-center mb-6">
                    <div className="relative h-64 flex flex-col items-center">
                        {!showPhotoPreview ? (
                            // Original photo display
                            <>
                                <img
                                    src={docs.photo?.url || '/public/assets/default-user.png'}
                                    alt="Owner"
                                    className="w-60 h-60 rounded-xl object-cover bg-green-500"
                                />
                                {/* Eye icon for viewing owner photo */}
                                {docs.photo?.url && (
                                    <div className="absolute top-2 left-2">
                                        <EyeOutlined
                                            className="cursor-pointer text-white text-xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
                                            onClick={() => setShowPhotoPreview(!showPhotoPreview)}
                                        />
                                    </div>
                                )}

                                {ownerKycStatus === 'approved' && (
                                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center shadow">
                                        Verified <span className="ml-1">&#10003;</span>
                                    </span>
                                )}
                                {ownerKycStatus === 'rejected' && (
                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center shadow">
                                        Rejected <span className="ml-1">&#10005;</span>
                                    </span>
                                )}
                                {ownerKycStatus === 'pending' && (
                                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full flex items-center shadow">
                                        Pending
                                    </span>
                                )}

                                {/* Original approve/reject buttons - shows when photo preview is not active */}
                                {docs.photo?.url && ownerKycStatus !== 'approved' && ownerKycStatus !== 'rejected' && !showRejectReason && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex gap-4">
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold flex items-center"
                                            onClick={async () => {
                                                await handleDocAction('photo', 'approved');
                                                setOwnerKycStatus('approved');
                                            }}
                                        >
                                            Verify <span className="ml-2">&#10003;</span>
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold flex items-center"
                                            onClick={() => setShowRejectReason(true)}
                                        >
                                            Reject <span className="ml-2">&#10005;</span>
                                        </button>
                                    </div>
                                )}
                                {showRejectReason && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center">
                                        <Input.TextArea
                                            rows={2}
                                            className="mb-2 w-64"
                                            placeholder="Rejection reason * "
                                            value={rejectionReasons.photo || ''}
                                            onChange={e => updateRejectionReason('photo', e.target.value)}
                                            required
                                        />
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold flex items-center mb-2"
                                            onClick={async () => {
                                                await handleDocAction('photo', 'rejected');
                                                setOwnerKycStatus('rejected');
                                                setShowRejectReason(false);
                                                updateRejectionReason('photo', '');
                                            }}
                                        >
                                            Confirm Reject
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Photo preview - same as before but with approve/reject buttons
                            <div className="w-60 h-60 rounded-xl bg-green-500 flex flex-col items-center justify-center relative">
                                <img
                                    src={docs.photo?.url || '/public/assets/default-user.png'}
                                    alt="Owner"
                                    className="w-full h-full rounded-xl object-cover"
                                />
                                {/* Approve/reject buttons positioned inside the image card */}
                                {docs.photo?.url && !showRejectReason && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex gap-4">
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold flex items-center"
                                            onClick={async () => {
                                                await handleDocAction('photo', 'approved');
                                                setOwnerKycStatus('approved');
                                                setShowPhotoPreview(false);
                                            }}
                                        >
                                            Verify <span className="ml-2">&#10003;</span>
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold flex items-center"
                                            onClick={() => setShowRejectReason(true)}
                                        >
                                            Reject <span className="ml-2">&#10005;</span>
                                        </button>
                                    </div>
                                )}
                                {showRejectReason && (
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center">
                                        <Input.TextArea
                                            rows={2}
                                            className="mb-2 w-64"
                                            placeholder="Rejection reason *"
                                            value={rejectionReasons.photo || ''}
                                            onChange={e => updateRejectionReason('photo', e.target.value)}
                                            required
                                        />
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold flex items-center mb-2"
                                            onClick={async () => {
                                                await handleDocAction('photo', 'rejected');
                                                setOwnerKycStatus('rejected');
                                                setShowPhotoPreview(false);
                                                setShowRejectReason(false);
                                                updateRejectionReason('photo', '');
                                            }}
                                        >
                                            Confirm Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 text-start">
                        <div className="font-semibold text-lg">Name: {user?.name || '-'}</div>
                        <div className="text-sm mt-1">Phone number: {user?.phone || '-'}</div>
                        <div className="text-sm mt-1">City: {user?.city || '-'}</div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-4">
                    {docFields.map(({ key, label }) => (
                        <div
                            key={key}
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
                                    <span>{label}</span>
                                    {docs[key]?.url && (
                                        <EyeOutlined
                                            className="cursor-pointer text-xl"
                                            onClick={() => setPreviewDoc(key)}
                                        />
                                    )}
                                </div>
                            </div>
                            {/* Status - 30% */}
                            <div className="ml-4 text-sm font-semibold flex items-center w-[30%]">
                                <span
                                    className={
                                        docStatus[key]?.status === 'approved'
                                            ? 'text-green-600'
                                            : docStatus[key]?.status === 'rejected'
                                                ? 'text-red-500'
                                                : 'text-yellow-500'
                                    }
                                >
                                    {docStatus[key]?.status === 'approved' && <>Verified <span className="ml-1">&#10003;</span></>}
                                    {docStatus[key]?.status === 'rejected' && <>Rejected <span className="ml-1">&#10005;</span></>}
                                    {!docStatus[key]?.status && 'Pending'}
                                </span>
                            </div>

                        </div>
                    ))}
                </div>
                <div className="w-full flex justify-center mt-6">
                    <button
                        className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-lg px-10 py-3 text-lg shadow"
                        onClick={() => {
                            // Check if all documents are approved
                            const allDocsApproved = Object.values(docStatus).every(doc => doc.status === 'approved');

                            if (allDocsApproved) {
                                message.success('All documents have been successfully approved!');
                            } else {
                                message.error('Some documents are still pending or rejected. Please review all documents.');
                            }

                            onClose();
                        }}
                        type="button"
                    >
                        Done
                    </button>
                </div>
                {/* Preview Modal */}
                <Modal
                    open={!!previewDoc}
                    onCancel={() => {
                        setPreviewDoc(null);
                        setShowRejectReason(false);
                        updateRejectionReason(previewDoc, '');
                    }}
                    footer={null}
                    centered
                    closable={false}
                    title={
                        <div className="w-full text-center font-semibold relative flex items-center justify-center">
                            <span
                                className="absolute left-0 cursor-pointer text-2xl"
                                onClick={() => {
                                    setPreviewDoc(null);
                                    setShowRejectReason(false);
                                    updateRejectionReason(previewDoc, '');
                                }}
                            >
                                &lt;
                            </span>
                            {previewDoc ? docFields.find(f => f.key === previewDoc)?.label : ''}
                        </div>
                    }
                >
                    {previewDoc && docs[previewDoc]?.url && (
                        <div className="flex flex-col items-center relative">
                            <img
                                src={docs[previewDoc].url}
                                alt={previewDoc}
                                className="max-w-[400px] max-h-[300px] w-auto h-auto object-contain mb-6 mx-auto bg-gray-100 rounded"
                            />
                            <div className="flex gap-4 justify-center mt-4">
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-2 flex items-center border-none outline-none"
                                    onClick={() => {
                                        handleDocAction(previewDoc, 'approved');
                                        setPreviewDoc(null);
                                        setShowRejectReason(false);
                                        updateRejectionReason(previewDoc, '');
                                    }}
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
                            {showRejectReason && (
                                <div className="w-full flex flex-col items-center mt-4">
                                    <Input.TextArea
                                        rows={2}
                                        className="mb-2 w-64"
                                        placeholder="Rejection reason *"
                                        value={rejectionReasons[previewDoc] || ''}
                                        onChange={e => updateRejectionReason(previewDoc, e.target.value)}
                                        required
                                    />
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full px-6 py-2 flex items-center border-none outline-none"
                                        onClick={() => {
                                            handleDocAction(previewDoc, 'rejected');
                                            setShowRejectReason(false);
                                            updateRejectionReason(previewDoc, '');
                                            setPreviewDoc(null);
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
                {/* Owner Details Section - now below */}

            </div>
        </Modal>
    )
} 