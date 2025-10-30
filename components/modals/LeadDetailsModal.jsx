import React, { useEffect, useRef, useState } from 'react'
import { Carousel, Modal } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import LeadsApi from 'lib/services/car.services'
import { getLeadDetails } from 'lib/services/leads.services'
import ListItem from 'components/pages/leads/ListItem'
import {
    checkImage,
    FileImage,
    formatDateDDMMYYYY,
    formatDateDDMMYYYYTime,
} from 'lib/utils/helper'
import Image from 'next/image'
import AddLeadModal from './AddLeadModal'
import { useConfirm } from 'lib/hooks/useConfirm'
import { useQueryClient } from 'react-query'
import useToast from 'lib/hooks/useToast'
import useApi from 'lib/hooks/useApi'
import {
    ExpandIcon,
    LeftArrowIcon,
    RightArrowIcon,
} from 'public/assets/common/icons'
import {
    getDocumentBlob,
    revokeDocumentBlob,
    verifyDocument,
} from 'lib/services/document.service'

export default function LeadDetailsModal({
    item,
    cacheKey,
    isModalOpen,
    handleModal,
}) {
    const [tab, setTab] = useState('Owner info')
    const [fullView, setFullView] = useState(false)
    const [leadDetails, setLeadDetails] = useState(null)
    const [loadingDetails, setLoadingDetails] = useState(false)

    const carouselRef = useRef()
    const carouselRefMain = useRef()
    const { isConfirmed } = useConfirm()
    const queryClient = useQueryClient()
    const { success, error } = useToast()
    const API_getLeadDetails = useApi(getLeadDetails)

    // Fetch fresh lead details when modal opens to get signed URLs
    useEffect(() => {
        if (isModalOpen && item?._id) {
            fetchFreshLeadDetails()
        } else {
            // Reset when modal closes
            setLeadDetails(null)
        }
    }, [isModalOpen, item?._id])

    const fetchFreshLeadDetails = async () => {
        try {
            setLoadingDetails(true)
            const res = await API_getLeadDetails.request(item._id)
            if (res?.data?.data) {
                // Use fresh data with signed URLs, fallback to item if fetch fails
                const freshData = Array.isArray(res.data.data)
                    ? res.data.data[0]
                    : res.data.data
                setLeadDetails(freshData || item)
            } else {
                // Fallback to original item if API fails
                setLeadDetails(item)
            }
        } catch (err) {
            console.error('Error fetching fresh lead details:', err)
            // Fallback to original item on error
            setLeadDetails(item)
        } finally {
            setLoadingDetails(false)
        }
    }

    // Use fresh leadDetails if available, otherwise fallback to item
    const displayItem = leadDetails || item

    const tabs = [
        {
            title: 'Owner info',
            onclick: () => handleTab('Owner info'),
        },
        {
            title: 'Vehicle info',
            onclick: () => handleTab('Vehicle info'),
        },
        ...(displayItem?.car_type === 'auction'
            ? [
                  {
                      title: 'Auction info',
                      onclick: () => handleTab('Auction info'),
                  },
              ]
            : []),
        {
            title: 'Documents',
            onclick: () => handleTab('Documents'),
        },
        {
            title: 'Notes',
            onclick: () => handleTab('Notes'),
        },
    ]

    const handleTab = (newTab) => {
        setTab(newTab)
    }

    const [editModal, setEditModal] = useState(false)

    const handleEditModal = () => {
        setEditModal(!editModal)
    }

    const API_deleteLead = useApi(LeadsApi.deleteALead)
    const handleDeleteLead = async (id) => {
        try {
            if (
                await isConfirmed({
                    title: 'Delete this lead',
                    description: 'Are you sure you want to delete this lead?',
                    confirmButtonLabel: 'Yes',
                    cancelButtonLabel: 'No',
                })
            ) {
                const res = await API_deleteLead.request(id)
                if (res?.isError) {
                    error('Failed to delete this lead.')
                } else {
                    handleModal()
                    success('Lead deleted successfully')
                    queryClient.invalidateQueries([cacheKey])
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleFullView = (state) => {
        setFullView(state)
    }

    return (
        <Modal
            centered
            // title=""
            open={isModalOpen}
            footer={null}
            width={450}
            onCancel={handleModal}
            className="relative"
        >
            <div className="w-full pb-6">
                <div className="px-3 mb-3 mt-5 flex flex-col items-center">
                    <div className="group">
                        <div class="relative">
                            <div className="w-[390px]">
                                <Carousel
                                    ref={carouselRef}
                                    draggable={true}
                                    effect="fade"
                                    infinite={true}
                                    dotPosition="bottom"
                                >
                                    {(() => {
                                        // Get car images from documents
                                        const carImageKeys = [
                                            'car_front',
                                            'car_back',
                                            'car_left',
                                            'car_right',
                                            'car_interior_front',
                                            'car_interior_back',
                                            'car_frontside_left',
                                            'car_frontside_right',
                                            'car_backside_right',
                                            'car_backside_left',
                                            'odometer',
                                        ]
                                        // Use documentImageLinks from API if available (API proxy URLs)
                                        // Otherwise fall back to constructing API proxy URLs from s3Key
                                        const carImages = carImageKeys
                                            .map((key) => {
                                                // Prefer documentImageLinks from fresh API call (signed URLs)
                                                if (
                                                    displayItem
                                                        ?.documentImageLinks?.[
                                                        key
                                                    ]
                                                ) {
                                                    return {
                                                        key,
                                                        url: displayItem
                                                            .documentImageLinks[
                                                            key
                                                        ],
                                                    }
                                                }
                                                // Fallback: construct API proxy URL from s3Key
                                                if (
                                                    displayItem?.documents?.[
                                                        key
                                                    ]?.s3Key &&
                                                    displayItem?._id
                                                ) {
                                                    return {
                                                        key,
                                                        url: `/api/lead/document/${key}?leadId=${displayItem._id}&type=${key}`,
                                                    }
                                                }
                                                return null
                                            })
                                            .filter(Boolean)

                                        if (carImages.length > 0) {
                                            return carImages.map(
                                                (imageData, i) => {
                                                    const imageUrl =
                                                        imageData?.url ||
                                                        '/assets/common/dummy_car.svg'

                                                    return (
                                                        <img
                                                            key={i}
                                                            className="w-[309px] h-[165px] object-contain rounded-lg"
                                                            src={imageUrl}
                                                            alt={`Slide ${i}`}
                                                            onError={(e) => {
                                                                try {
                                                                    const current =
                                                                        e.target
                                                                            .src
                                                                    const fixed =
                                                                        current
                                                                    if (
                                                                        fixed &&
                                                                        fixed !==
                                                                            current
                                                                    ) {
                                                                        e.target.src =
                                                                            fixed
                                                                        return
                                                                    }
                                                                } catch (err) {
                                                                    console.warn(
                                                                        'Carousel image onError fallback exception:',
                                                                        err
                                                                    )
                                                                }
                                                                e.target.src =
                                                                    '/assets/common/dummy_car.svg'
                                                            }}
                                                        />
                                                    )
                                                }
                                            )
                                        } else if (
                                            displayItem?.image_keys_signed_urls
                                                ?.length > 0
                                        ) {
                                            // Use signed URLs from API if available
                                            return displayItem.image_keys_signed_urls.map(
                                                (imageUrl, i) => {
                                                    return (
                                                        <img
                                                            key={i}
                                                            className="w-[309px] h-[165px] object-contain rounded-lg"
                                                            src={
                                                                imageUrl ||
                                                                '/assets/common/dummy_car.svg'
                                                            }
                                                            alt={`Slide ${i}`}
                                                        />
                                                    )
                                                }
                                            )
                                        } else if (
                                            displayItem?.image_keys?.length > 0
                                        ) {
                                            return displayItem?.image_keys?.map(
                                                (imageKey, i) => {
                                                    const imageUrl = imageKey
                                                        ? FileImage(imageKey)
                                                        : '/assets/common/dummy_car.svg'

                                                    return (
                                                        <img
                                                            key={i}
                                                            className="w-[309px] h-[165px] object-contain rounded-lg"
                                                            src={imageUrl}
                                                            alt={`Slide ${i}`}
                                                        />
                                                    )
                                                }
                                            )
                                        } else {
                                            return (
                                                <img
                                                    className="w-[309px] h-[165px] object-contain rounded-lg"
                                                    src={
                                                        '/assets/common/dummy_car.svg'
                                                    }
                                                    alt={`Default image`}
                                                />
                                            )
                                        }
                                    })()}
                                </Carousel>
                                {(() => {
                                    // Check if we have car images from documents or image_keys
                                    const carImageKeys = [
                                        'car_front',
                                        'car_back',
                                        'car_left',
                                        'car_right',
                                        'car_interior_front',
                                        'car_interior_back',
                                        'car_frontside_left',
                                        'car_frontside_right',
                                        'car_backside_right',
                                        'car_backside_left',
                                        'odometer',
                                    ]
                                    const carImages = carImageKeys
                                        .map(
                                            (key) =>
                                                displayItem?.documents?.[key]
                                                    ?.s3Key
                                        )
                                        .filter(Boolean)
                                    const hasImages =
                                        carImages.length > 0 ||
                                        displayItem?.image_keys?.length > 0 ||
                                        displayItem?.image_keys_signed_urls
                                            ?.length > 0

                                    return (
                                        hasImages && (
                                            <div className="flex items-center gap-3 m-2">
                                                <div className="flex w-full justify-between gap-3">
                                                    <div
                                                        onClick={() =>
                                                            carouselRef.current.prev()
                                                        }
                                                        className="cursor-pointer w-8 h-8 bg-gray-extraLight rounded-full flex justify-center items-center"
                                                    >
                                                        <LeftArrowIcon />
                                                    </div>
                                                    <div
                                                        onClick={() =>
                                                            carouselRef.current.next()
                                                        }
                                                        className="cursor-pointer w-8 h-8 bg-gray-extraLight rounded-full flex justify-center items-center"
                                                    >
                                                        <RightArrowIcon />
                                                    </div>
                                                </div>
                                                <div
                                                    onClick={() =>
                                                        handleFullView(true)
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <ExpandIcon />
                                                </div>
                                            </div>
                                        )
                                    )
                                })()}
                            </div>
                        </div>
                    </div>

                    <Modal
                        centered
                        // title=""
                        open={fullView}
                        footer={null}
                        width={1500}
                        onCancel={() => handleFullView(false)}
                        className="relative"
                    >
                        <div className="h-[80vh] flex justify-center items-center p-4">
                            <div className="w-full relative max-w-5xl">
                                <Carousel
                                    ref={carouselRefMain}
                                    draggable={true}
                                    effect="fade"
                                    infinite={true}
                                    dotPosition="bottom"
                                >
                                    {(() => {
                                        // Get car images from documents
                                        const carImageKeys = [
                                            'car_front',
                                            'car_back',
                                            'car_left',
                                            'car_right',
                                            'car_interior_front',
                                            'car_interior_back',
                                            'car_frontside_left',
                                            'car_frontside_right',
                                            'car_backside_right',
                                            'car_backside_left',
                                            'odometer',
                                        ]
                                        // Use documentImageLinks from API if available (API proxy URLs)
                                        // Otherwise fall back to constructing API proxy URLs from s3Key
                                        const carImages = carImageKeys
                                            .map((key) => {
                                                // Prefer documentImageLinks from fresh API call (signed URLs)
                                                if (
                                                    displayItem
                                                        ?.documentImageLinks?.[
                                                        key
                                                    ]
                                                ) {
                                                    return {
                                                        key,
                                                        url: displayItem
                                                            .documentImageLinks[
                                                            key
                                                        ],
                                                    }
                                                }
                                                // Fallback: construct API proxy URL from s3Key
                                                if (
                                                    displayItem?.documents?.[
                                                        key
                                                    ]?.s3Key &&
                                                    displayItem?._id
                                                ) {
                                                    return {
                                                        key,
                                                        url: `/api/lead/document/${key}?leadId=${displayItem._id}&type=${key}`,
                                                    }
                                                }
                                                return null
                                            })
                                            .filter(Boolean)

                                        if (carImages.length > 0) {
                                            return carImages.map(
                                                (imageData, i) => {
                                                    return (
                                                        <img
                                                            key={i}
                                                            className="w-full h-[70vh] object-contain rounded-lg"
                                                            src={
                                                                imageData?.url ||
                                                                '/assets/common/dummy_car.svg'
                                                            }
                                                            alt={`Car image ${i}`}
                                                            onError={(e) => {
                                                                try {
                                                                    const current =
                                                                        e.target
                                                                            .src
                                                                    const fixed =
                                                                        current
                                                                    if (
                                                                        fixed &&
                                                                        fixed !==
                                                                            current
                                                                    ) {
                                                                        e.target.src =
                                                                            fixed
                                                                        return
                                                                    }
                                                                } catch (err) {
                                                                    console.warn(
                                                                        'FullView carousel image onError fallback exception:',
                                                                        err
                                                                    )
                                                                }
                                                                e.target.src =
                                                                    '/assets/common/dummy_car.svg'
                                                            }}
                                                        />
                                                    )
                                                }
                                            )
                                        } else if (
                                            displayItem?.image_keys_signed_urls
                                                ?.length > 0
                                        ) {
                                            // Use signed URLs from API response
                                            return displayItem.image_keys_signed_urls.map(
                                                (imageUrl, i) => {
                                                    return (
                                                        <img
                                                            key={i}
                                                            className="w-full h-[70vh] object-contain rounded-lg"
                                                            src={
                                                                imageUrl ||
                                                                '/assets/common/dummy_car.svg'
                                                            }
                                                            alt={`Car image ${i}`}
                                                        />
                                                    )
                                                }
                                            )
                                        } else {
                                            return (
                                                <img
                                                    className="w-full h-[70vh] object-contain rounded-lg"
                                                    src="/assets/common/dummy_car.svg"
                                                    alt="Default car image"
                                                />
                                            )
                                        }
                                    })()}
                                </Carousel>

                                <div className="flex w-full justify-center items-center gap-3 mt-4">
                                    <div
                                        onClick={() =>
                                            carouselRefMain.current.prev()
                                        }
                                        className="cursor-pointer w-8 h-8 bg-gray-extraLight rounded-full flex justify-center items-center"
                                    >
                                        <LeftArrowIcon />
                                    </div>
                                    <div
                                        onClick={() =>
                                            carouselRefMain.current.next()
                                        }
                                        className="cursor-pointer w-8 h-8 bg-gray-extraLight rounded-full flex justify-center items-center"
                                    >
                                        <RightArrowIcon />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    <div className="w-full flex justify-start mt-3">
                        <div className="px-4 py-[6px] btn-gradient text-xs text-white rounded-full">
                            {displayItem?.car_type === 'pre-owned'
                                ? 'User-Owned Cars'
                                : 'Bank Auction Cars'}
                        </div>
                    </div>
                    <div className="w-full flex gap-4 justify-between mt-4">
                        {tabs?.map((item, i) => {
                            return (
                                <div
                                    key={i}
                                    onClick={item?.onclick}
                                    className={`w-1/2 ${
                                        tab === item?.title
                                            ? 'border-line'
                                            : 'py-3 cursor-pointer'
                                    } ${
                                        item?.car_type === 'auction' &&
                                        'flex justify-end'
                                    }`}
                                >
                                    <p
                                        className={` text-left ${
                                            i === 0
                                                ? 'text-start'
                                                : i === tabs.length - 1
                                                ? 'text-end'
                                                : 'text-lsft'
                                        }${
                                            item?.title === tab
                                                ? 'plus-jakarta-sans text-[#1E293B] mt-[10px] pb-[3px] text-[15px]'
                                                : 'plus-jakarta-sans text-[#475569] text-[15px]'
                                        }`}
                                    >
                                        {item?.title}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                    {/* <div className="bg-[#d3d4d8] mb-6 h-[3px] rounded-full w-full" /> */}
                    {loadingDetails ? (
                        <div className="w-full pt-6 flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                        </div>
                    ) : (
                        <div className="w-full pt-6 border-t-[3px] border-solid border-[#d3d4d8]">
                            {tab === 'Owner info' ? (
                                <OwnerInfo details={displayItem?.owner} />
                            ) : tab === 'Vehicle info' ? (
                                <VehicleInfo details={displayItem} />
                            ) : tab === 'Documents' ? (
                                <DocumentsInfo
                                    details={displayItem}
                                    cacheKey={cacheKey}
                                />
                            ) : tab === 'Notes' ? (
                                <Notes details={displayItem} />
                            ) : (
                                displayItem?.car_type === 'auction' && (
                                    <AuctionInfo
                                        details={displayItem?.auction_details}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="w-fit absolute bottom-6 right-4 flex justify-end">
                <ul className="flex">
                    <li className="px-2">
                        <span
                            onClick={handleEditModal}
                            className="block w-5 cursor-pointer"
                        >
                            <img
                                className="w-full"
                                src="/assets/common/edit-gradient.svg"
                            />
                        </span>
                        <AddLeadModal
                            mode="edit"
                            details={displayItem || item}
                            isModalOpen={editModal}
                            handleModal={handleEditModal}
                        />
                    </li>
                    <li className="px-2">
                        <span
                            onClick={() =>
                                handleDeleteLead((displayItem || item)?._id)
                            }
                            className="block w-5 cursor-pointer"
                        >
                            <img
                                className="w-full"
                                src="/assets/common/delete-gradient.svg"
                            />
                        </span>
                    </li>
                </ul>
            </div>
        </Modal>
    )
}

function OwnerInfo({ details }) {
    return (
        <div className="w-full flex justify-start flex-col gap-3 plus-jakarta-sans">
            <ListItem keyName="Name" value={details?.name} />
            <ListItem keyName="Contact" value={details?.contact} />
        </div>
    )
}

function VehicleInfo({ details }) {
    return (
        <div className="w-full flex justify-start flex-col gap-3 plus-jakarta-sans">
            <ListItem
                keyName="Vehicle number"
                value={details?.vehicle?.number}
            />
            <ListItem keyName="Brand" value={details?.brand?.name} />
            <ListItem keyName="Model" value={details?.model?.name} />
            <ListItem keyName="Variant" value={details?.variant?.name} />
            <ListItem
                keyName="Year"
                value={details?.vehicle?.year_of_manufacture}
            />
            <ListItem
                keyName="Registered state"
                value={details?.vehicle?.registered_state}
            />
            <ListItem keyName="Fuel type" value={details?.fuel_type?.name} />
            <ListItem
                keyName="Transmission type"
                value={details?.transmission_type?.name}
            />
            <ListItem
                keyName="Kms driven"
                value={
                    details?.vehicle?.min_kilometers !== undefined &&
                    details?.vehicle?.max_kilometers
                        ? `${details?.vehicle?.min_kilometers}-${details?.vehicle?.max_kilometers} Kms driven`
                        : 'NIL'
                }
            />
            <ListItem
                keyName="Price"
                value={
                    details?.vehicle?.price
                        ? `₹${details?.vehicle?.price?.toLocaleString()}`
                        : 'NIL'
                }
            />
            <ListItem
                keyName="Location"
                value={
                    typeof details?.vehicle?.location === 'object'
                        ? details?.vehicle?.location?.name || 'NIL'
                        : // If it's a string, check if it's not empty and not the typical format of an ID? (length > 15 chars, all hex)
                        typeof details?.vehicle?.location === 'string' &&
                          details?.vehicle?.location.length < 15 // e.g. "Mumbai" not Mongo id
                        ? details?.vehicle?.location
                        : 'NIL'
                }
            />
            <ListItem
                keyName="Owner count"
                value={details?.vehicle?.owner_count || 'NIL'}
            />
        </div>
    )
}

function AuctionInfo({ details }) {
    return (
        <div className="w-full flex justify-start flex-col gap-3 plus-jakarta-sans">
            <ListItem keyName="Bank name" value={details?.bank_name} />
            <ListItem
                keyName="Auction start date"
                value={formatDateDDMMYYYYTime(details?.start_date)}
            />
            <ListItem
                keyName="Auction end date"
                value={formatDateDDMMYYYYTime(details?.end_date)}
            />
            <ListItem keyName="Auction location" value={details?.location} />
            <ListItem keyName="Reserve price" value={details?.reserve_price} />
            <ListItem keyName="EMD Amount" value={details?.emd_amount} />
            <ListItem
                keyName="EMD submission date and time"
                value={formatDateDDMMYYYYTime(details?.emd_date)}
            />
            <ListItem
                keyName="Inspection date"
                value={formatDateDDMMYYYY(details?.inspection_date)}
            />
            {/* <ListItem keyName="Notes" value={details?.notes} /> */}
        </div>
    )
}

function DocumentsInfo({ details, cacheKey }) {
    const [previewDoc, setPreviewDoc] = useState(null)
    const [showRejectReason, setShowRejectReason] = useState(false)
    const [rejectionReasons, setRejectionReasons] = useState({})
    const [documentUrls, setDocumentUrls] = useState({})
    const [loadingDocs, setLoadingDocs] = useState({})
    const [documentStatuses, setDocumentStatuses] = useState({})
    const { success, error } = useToast()
    const queryClient = useQueryClient()

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
            case 'verifying':
                return 'text-blue-500'
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
            case 'verifying':
                return (
                    <>
                        Verifying <span className="ml-1">⏳</span>
                    </>
                )
            case 'pending':
                return 'Pending'
            default:
                return 'Not Uploaded'
        }
    }

    const handleDocumentPreview = async (docType) => {
        if (details?.documents?.[docType]) {
            setPreviewDoc(docType)

            // For PDFs, always fetch the blob URL to ensure proper authentication
            const isPdf =
                documentTypes.find((f) => f.key === docType)?.type === 'pdf'

            if (isPdf && !documentUrls[docType] && !loadingDocs[docType]) {
                setLoadingDocs((prev) => ({ ...prev, [docType]: true }))
                try {
                    const blobUrl = await getDocumentBlob(details._id, docType)
                    setDocumentUrls((prev) => ({ ...prev, [docType]: blobUrl }))
                } catch (err) {
                    console.error('Error fetching PDF document:', err)
                    error('Failed to load PDF document')
                } finally {
                    setLoadingDocs((prev) => ({ ...prev, [docType]: false }))
                }
            } else if (
                !isPdf &&
                !documentUrls[docType] &&
                !loadingDocs[docType]
            ) {
                // For images, fetch blob URL if not already cached
                setLoadingDocs((prev) => ({ ...prev, [docType]: true }))
                try {
                    const blobUrl = await getDocumentBlob(details._id, docType)
                    setDocumentUrls((prev) => ({ ...prev, [docType]: blobUrl }))
                } catch (err) {
                    console.error('Error fetching document:', err)
                    error('Failed to load document')
                } finally {
                    setLoadingDocs((prev) => ({ ...prev, [docType]: false }))
                }
            }
        }
    }

    const getDocumentUrl = (docType) => {
        const document = details?.documents?.[docType]
        if (document?.s3Key) {
            // Use cached blob URL if available, otherwise return API URL
            if (documentUrls[docType]) {
                return documentUrls[docType]
            }

            // Fallback to API URL for initial load
            const apiUrl = `/api/lead/document/${docType}?leadId=${details._id}&type=${docType}`
            console.log('Using API URL for', docType, ':', apiUrl)
            return apiUrl
        } else if (document?.data) {
            // If document has data (stored in MongoDB), use API endpoint
            return `/api/upload_docs/${docType}?leadId=${details._id}&type=${docType}`
        }
        console.log('No document found for', docType)
        return null
    }

    const updateRejectionReason = (key, value) => {
        setRejectionReasons((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    // Cleanup blob URLs when component unmounts
    useEffect(() => {
        return () => {
            Object.values(documentUrls).forEach((blobUrl) => {
                revokeDocumentBlob(blobUrl)
            })
        }
    }, [documentUrls])

    const handleDocAction = async (docType, action) => {
        try {
            // Set status to verifying when action starts
            if (action === 'approved' || action === 'rejected') {
                setDocumentStatuses((prev) => ({
                    ...prev,
                    [docType]: 'verifying',
                }))
            }

            // Call the actual API to update document status
            const rejectionReason = rejectionReasons[docType] || ''
            await verifyDocument(details._id, docType, action, rejectionReason)

            // Update local state after successful API call
            if (action === 'approved') {
                success(
                    `${
                        documentTypes.find((d) => d.key === docType)?.label
                    } approved successfully!`
                )
                setDocumentStatuses((prev) => ({
                    ...prev,
                    [docType]: 'approved',
                }))
            } else if (action === 'rejected') {
                error(
                    `${
                        documentTypes.find((d) => d.key === docType)?.label
                    } rejected!`
                )
                setDocumentStatuses((prev) => ({
                    ...prev,
                    [docType]: 'rejected',
                }))
            }

            // Invalidate queries to refresh data
            if (cacheKey) {
                queryClient.invalidateQueries([cacheKey])
            }

            setPreviewDoc(null)
            setShowRejectReason(false)
            updateRejectionReason(docType, '')
        } catch (err) {
            console.error('Document verification error:', err)
            error('Failed to update document status')
            // Revert status back to pending on error
            setDocumentStatuses((prev) => ({
                ...prev,
                [docType]: 'pending',
            }))
        }
    }

    return (
        <>
            <div className="w-full flex justify-start flex-col gap-4 plus-jakarta-sans">
                <div className="w-full flex flex-col gap-4">
                    {documentTypes.map((doc) => {
                        const document = details?.documents?.[doc.key]
                        const isUploaded =
                            document && (document.data || document.s3Key)
                        const status =
                            documentStatuses[doc.key] ||
                            document?.status ||
                            (isUploaded ? 'pending' : 'not_uploaded')

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
                                            <div className="flex items-center gap-2">
                                                {loadingDocs[doc.key] && (
                                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                )}
                                                <EyeOutlined
                                                    className="cursor-pointer text-xl text-blue-500 hover:text-blue-700"
                                                    onClick={() =>
                                                        handleDocumentPreview(
                                                            doc.key
                                                        )
                                                    }
                                                />
                                            </div>
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

                {details?.documentStatus && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                                Overall Document Status:
                            </span>
                            <span
                                className={`text-sm font-semibold ${getStatusColor(
                                    details.documentStatus
                                )}`}
                            >
                                {getStatusText(details.documentStatus)}
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
                {previewDoc && details?.documents?.[previewDoc] && (
                    <div className="flex flex-col items-center relative">
                        {details.documents[previewDoc].data ||
                        details.documents[previewDoc].s3Key ? (
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
                                                    {details.documents[
                                                        previewDoc
                                                    ]?.originalName ||
                                                        'Document'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        {documentUrls[previewDoc] ? (
                                            <iframe
                                                src={documentUrls[previewDoc]}
                                                className="w-full h-full border-0 rounded-b-lg"
                                                title={`PDF Preview - ${
                                                    details.documents[
                                                        previewDoc
                                                    ]?.originalName ||
                                                    'Document'
                                                }`}
                                                onError={(e) => {
                                                    console.error(
                                                        'PDF iframe error:',
                                                        e
                                                    )
                                                    e.target.style.display =
                                                        'none'
                                                    e.target.nextSibling.style.display =
                                                        'flex'
                                                }}
                                            />
                                        ) : loadingDocs[previewDoc] ? (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                                    <p className="text-sm text-gray-600">
                                                        Loading PDF...
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <div className="text-center">
                                                    <div className="text-4xl mb-2">
                                                        ⚠️
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Failed to load PDF
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
                                        )}
                                        <div
                                            className="hidden w-full h-full items-center justify-center bg-gray-50"
                                            style={{ display: 'none' }}
                                        >
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">
                                                    ⚠️
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    PDF cannot be displayed
                                                    inline
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
                                <div className="w-full flex justify-center">
                                    <img
                                        src={
                                            getDocumentUrl(previewDoc) ||
                                            '/assets/common/dummy_car.svg'
                                        }
                                        alt={previewDoc}
                                        className="max-w-[400px] max-h-[300px] w-auto h-auto object-contain mb-6 bg-gray-100 rounded"
                                        onLoad={(e) => {
                                            console.log(
                                                'Image loaded successfully:',
                                                e.target.src
                                            )
                                        }}
                                        onError={(e) => {
                                            console.error(
                                                'Image load error:',
                                                e.target.src
                                            )

                                            // Try fallback to direct S3 URL
                                            const document =
                                                details?.documents?.[previewDoc]
                                            if (
                                                document?.s3Key &&
                                                !e.target.src.includes(
                                                    'staging-wheeliyo.s3.us-east-2.amazonaws.com'
                                                )
                                            ) {
                                                console.log(
                                                    'Trying direct S3 URL as fallback'
                                                )
                                                e.target.src = FileImage(
                                                    document.s3Key
                                                )
                                                return
                                            }

                                            // Try with different S3 URL format
                                            if (
                                                document?.s3Key &&
                                                e.target.src.includes(
                                                    'staging-wheeliyo.s3.us-east-2.amazonaws.com'
                                                )
                                            ) {
                                                console.log(
                                                    'Trying alternative S3 URL format'
                                                )
                                                const altUrl = `https://staging-wheeliyo.s3.amazonaws.com/${document.s3Key}`
                                                console.log(
                                                    'Alternative URL:',
                                                    altUrl
                                                )
                                                e.target.src = altUrl
                                                return
                                            }

                                            // If all fail, show error
                                            console.error(
                                                'All image loading attempts failed'
                                            )
                                            e.target.style.display = 'none'
                                            if (e.target.nextSibling) {
                                                e.target.nextSibling.style.display =
                                                    'block'
                                            }
                                        }}
                                    />
                                    <div
                                        style={{ display: 'none' }}
                                        className="text-center text-gray-500"
                                    >
                                        <div className="text-4xl mb-2">🖼️</div>
                                        <p>Image could not be loaded</p>
                                        <p className="text-xs mt-2">
                                            URL: {getDocumentUrl(previewDoc)}
                                        </p>
                                        <p className="text-xs mt-1">
                                            S3Key:{' '}
                                            {
                                                details?.documents?.[previewDoc]
                                                    ?.s3Key
                                            }
                                        </p>
                                        <p className="text-xs mt-1">
                                            S3 URL:{' '}
                                            {process.env
                                                .NEXT_PUBLIC_AWS_S3_URL ||
                                                'https://staging-wheeliyo.s3.us-east-2.amazonaws.com'}
                                        </p>
                                    </div>
                                </div>
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
                                        {details.documents[previewDoc]
                                            ?.status || 'Not Uploaded'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Buttons */}
                        <div className="flex gap-4 justify-center mt-4">
                            <button
                                className={`${
                                    documentStatuses[previewDoc] === 'verifying'
                                        ? 'bg-blue-500 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                } text-white font-semibold rounded-full px-6 py-2 flex items-center border-none outline-none`}
                                onClick={() =>
                                    handleDocAction(previewDoc, 'approved')
                                }
                                disabled={
                                    documentStatuses[previewDoc] === 'verifying'
                                }
                                type="button"
                            >
                                {documentStatuses[previewDoc] ===
                                'verifying' ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">&#10003;</span>{' '}
                                        Verify
                                    </>
                                )}
                            </button>
                            <button
                                className={`${
                                    documentStatuses[previewDoc] === 'verifying'
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600'
                                } text-white font-semibold rounded-full px-6 py-2 flex items-center border-none outline-none`}
                                onClick={() => setShowRejectReason(true)}
                                disabled={
                                    documentStatuses[previewDoc] === 'verifying'
                                }
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
                                        if (
                                            rejectionReasons[previewDoc]?.trim()
                                        ) {
                                            handleDocAction(
                                                previewDoc,
                                                'rejected'
                                            )
                                            setShowRejectReason(false)
                                            updateRejectionReason(
                                                previewDoc,
                                                ''
                                            )
                                        } else {
                                            error(
                                                'Please provide a rejection reason'
                                            )
                                        }
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

function Notes({ details }) {
    return (
        <div className="w-full flex justify-start flex-col gap-3 plus-jakarta-sans">
            <p className="text-sm plus-jakarta-sans font-normal">
                {details?.vehicle?.notes || 'No notes found!'}
            </p>
        </div>
    )
}
