import React, { useRef, useState } from 'react'
import { CrossIconXs, PluIcon } from 'public/assets/common/icons'
import { handleImageCompressArray } from 'lib/utils/helper'
import Loader from 'components/display/Loader'
import useToast from 'lib/hooks/useToast'

export default function FileInput({
    label,
    value,
    preview,
    setPreview,
    setFiles,
    error = null,
    postFix = null,
    maximumFiles = 8,
    multiple = true,
    acceptedFiles = [],
    setExistingImages,
    className = 'h-[133px] p-3 flex flex-col justify-center items-center border-[1.5px] border-solid border-[#E2E8F0] placeholder:text-[#94A3B8]',
}) {
    const isError = error !== null
    const inputFileRef = useRef()
    const { warning } = useToast()
    const [loading, setLoading] = useState(false)

    // Open file picker
    const handleOpenFilePicker = () => {
        inputFileRef.current.click()
    }

    // Handle file change and compress images
    const handleFileChange = async (e) => {
        setLoading(true)
        const fileArray = Array.from(e.target.files)

        // Check current number of files
        const currentFilesCount = preview.length

        if (currentFilesCount + fileArray.length > maximumFiles) {
            // Only take the allowed number of new files
            const allowedFiles = fileArray.slice(
                0,
                maximumFiles - currentFilesCount
            )
            const compressedImages = await handleImageCompressArray(
                allowedFiles
            )

            if (allowedFiles.length > 0) {
                const previewImages = allowedFiles.map((item) =>
                    URL.createObjectURL(item)
                )
                setPreview((prev) => [...prev, ...previewImages])
                setFiles((prev) => [...prev, ...compressedImages])
            }
            warning(`Maximum file limit is ${maximumFiles}.`)
        } else {
            const compressedImages = await handleImageCompressArray(fileArray)

            if (fileArray.length > 0) {
                const previewImages = fileArray.map((item) =>
                    URL.createObjectURL(item)
                )
                setPreview((prev) => [...prev, ...previewImages])
                setFiles((prev) => [...prev, ...compressedImages])
            }
        }
        setLoading(false)
    }

    const handleRemoveImage = (index) => {
        setPreview((prev) => {
            const S3URL = `${process.env.NEXT_PUBLIC_AWS_S3_URL}/`
            const removedImage = prev[index]?.replace(S3URL, '')
            setExistingImages((existingImages) => [
                ...existingImages,
                removedImage,
            ])
            return prev.filter((_, i) => i !== index)
        })
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="w-full">
            {label && (
                <p className="text-[#475569] text-[14px] flex items-center font-normal leading-[23px] mb-2">
                    {label}&nbsp; {postFix && <span>{postFix}</span>}
                </p>
            )}
            <div
                className={`cursor-pointer w-full ${className} ${
                    isError && 'border border-solid border-[#D12E34]'
                }`}
            >
                {loading ? (
                    <div className="w-full h-fit flex flex-col gap-2 justify-center items-center">
                        <div className="w-6 h-6 p-1 flex justify-center items-center bg-gradient-to-tr animate-spin from-[#D01768] to-[#CF1669] via-[#F55C33] rounded-full">
                            <div className="bg-white rounded-full">
                                <div className="w-3 h-3 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-xs">One moment, please…</p>
                    </div>
                ) : preview?.length > 0 ? (
                    <div className="w-full my-2 flex flex-col gap-2 rounded-md items-center justify-center">
                        <div className="flex flex-row gap-1 items-center">
                            {preview?.map((item, i) => (
                                <div key={i} className="relative">
                                    <img
                                        src={item}
                                        alt="Image preview"
                                        className="w-[60px] h-[60px] rounded-full object-cover"
                                        style={{ boxSizing: 'border-box' }}
                                        onError={(e) => {
                                            try {
                                                const current = e.target.src
                                                if (
                                                    current &&
                                                    current.includes('staging-wheeliyo.s3.ap-south-1.amazonaws.com/')
                                                ) {
                                                    e.target.src = current.replace(
                                                        'staging-wheeliyo.s3.ap-south-1.amazonaws.com/',
                                                        'staging-wheeliyo.s3.us-east-2.amazonaws.com/'
                                                    )
                                                    return
                                                }
                                                if (
                                                    current &&
                                                    current.includes('staging-wheeliyo.s3.amazonaws.com/')
                                                ) {
                                                    e.target.src = current.replace(
                                                        'staging-wheeliyo.s3.amazonaws.com/',
                                                        'staging-wheeliyo.s3.us-east-2.amazonaws.com/'
                                                    )
                                                    return
                                                }
                                                if (
                                                    current &&
                                                    current.includes('wheeliyo-prod.s3.us-east-2.amazonaws.com/')
                                                ) {
                                                    e.target.src = current.replace(
                                                        'wheeliyo-prod.s3.us-east-2.amazonaws.com/',
                                                        'wheeliyo-prod.s3.ap-south-1.amazonaws.com/'
                                                    )
                                                    return
                                                }
                                                if (
                                                    current &&
                                                    current.includes('wheeliyo-prod.s3.amazonaws.com/')
                                                ) {
                                                    e.target.src = current.replace(
                                                        'wheeliyo-prod.s3.amazonaws.com/',
                                                        'wheeliyo-prod.s3.ap-south-1.amazonaws.com/'
                                                    )
                                                    return
                                                }
                                            } catch (err) {
                                                console.warn('Image onError fallback exception:', err)
                                            }
                                            e.target.src =
                                                '/assets/common/dummy_car.svg'
                                        }}
                                    />
                                    <div
                                        onClick={() => handleRemoveImage(i)}
                                        className="w-4 h-4 absolute drop-shadow-gray-normal bg-gray-extraLight rounded-full flex justify-center items-center top-0 right-0 cursor-pointer"
                                    >
                                        <CrossIconXs />
                                    </div>
                                </div>
                            ))}
                            {preview?.length < maximumFiles && (
                                <div
                                    onClick={handleOpenFilePicker}
                                    className="w-[60px] drop-shadow-gray-normal h-[60px] bg-gray-extraLight rounded-full object-cover flex justify-center items-center cursor-pointer"
                                >
                                    <PluIcon />
                                </div>
                            )}
                        </div>
                        <p className="text-grayMedium text-xs">{value?.name}</p>
                    </div>
                ) : (
                    !loading && (
                        <div
                            className="w-full h-full flex items-center justify-center flex-col"
                            onClick={handleOpenFilePicker}
                        >
                            <img
                                className="w-3 h-4 mb-1 object-contain"
                                src="/assets/common/file-upload.svg"
                            />
                            <p className="text-[#94A3B8] text-[14px] max-w-[200px] truncate">
                                {value?.name || 'Upload vehicle image'}
                            </p>
                        </div>
                    )
                )}
            </div>
            <input
                type="file"
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
                ref={inputFileRef}
                accept={acceptedFiles.join(',')}
            />
            {error && (
                <p className="text-[#D12E34] text-md font-normal leading-[23px] mt-2">
                    {error?.message}
                </p>
            )}
        </div>
    )
}
