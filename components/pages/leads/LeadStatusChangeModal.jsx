import React, { useEffect, useState } from 'react'
import useApi from 'lib/hooks/useApi'
import LeadsApi from 'lib/services/car.services'
import { useQueryClient } from 'react-query'
import useToast from 'lib/hooks/useToast'
import { Checkbox, Modal } from 'antd'

export default function LeadStatusChangeModal({
    open,
    ids,
    cacheKey,
    handleCancel,
    setIsSelectedAll,
    defaultValue,
    setSelectedRowKeys,
}) {
    const [loading, setLoading] = useState(false)
    const [action, setAction] = useState(defaultValue)

    const queryClient = useQueryClient()
    const { success, error } = useToast()

    const API_shareContact = useApi(LeadsApi.approveLeads)

    const handleApproveLeads = async () => {
        try {
            setLoading(true)
            const payloads = {
                ids: ids,
                action: action,
            }

            const res = await API_shareContact.request(payloads)
            if (res?.isError) {
                setLoading(false)
                if (action === 'approve') {
                    error('Failed to approve this leads.')
                } else {
                    error('Failed to unapprove this leads.')
                }
            } else {
                if (action === 'approve') {
                    success('Lead approved successfully')
                } else {
                    success('Lead unapproved successfully')
                }
                setLoading(false)
                handleCancel()
                setAction(null)
                setIsSelectedAll(false)
                setSelectedRowKeys([])
                queryClient.invalidateQueries([cacheKey])
            }
        } catch (error) {
            console.log(error)
        }
    }

    // useEffect(() => {
    //     setAction(null)
    // }, [open])

    return (
        <Modal
            centered
            style={{
                borderRadius: '18px',
            }}
            width={499}
            open={open}
            onCancel={handleCancel}
            footer={null}
        >
            <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full pt-3">
                    <p classaName="text-lg font-normal mb-6">
                        Approve/Hide contact details
                    </p>
                    <div className="flex flex-col gap-3 my-4">
                        <div
                            className={`flex items-center gap-2 ${defaultValue === 'unapprove' && 'opacity-50'
                                }`}
                        >
                            <Checkbox
                                checked={action === 'approve'}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setAction('approve')
                                    } else {
                                        setAction(null)
                                    }
                                }}
                                disabled={defaultValue === 'unapprove'}
                            />
                            <p className={`text-[13px] text-black `}>
                                Approve contact details of unapproved leads
                            </p>
                        </div>

                        <div
                            className={`flex items-center gap-2 ${defaultValue === 'approve' && 'opacity-50'
                                }`}
                        >
                            <Checkbox
                                checked={action === 'unapprove'}
                                onChange={(e) => {
                                    if (defaultValue === 'approve') return
                                    if (e.target.checked) {
                                        setAction('unapprove')
                                    } else {
                                        setAction(null)
                                    }
                                }}
                                disabled={defaultValue === 'approve'}
                            />
                            <p className={`text-[13px] text-black`}>
                                Hide contact details of selected approved leads
                            </p>
                        </div>
                    </div>

                    <div className="flex mt-5 justify-end items-center w-full">
                        <span className="pr-2">
                            <p
                                onClick={handleCancel}
                                className="cursor-pointer text-[17px]"
                            >
                                Cancel
                            </p>
                        </span>
                        <span className="pl-2">
                            <p
                                onClick={() => {
                                    if (action === null || loading) return
                                    handleApproveLeads()
                                }}
                                className={`cursor-pointer text-[17px] text-gradient ${action === null && 'opacity-50'
                                    }`}
                            >
                                Yes
                            </p>
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
