'use client'
import dayjs from 'dayjs'
import React from 'react'
import { deleteNotification } from 'lib/services/notification.services'
import useApi from 'lib/hooks/useApi'
import useToast from 'lib/hooks/useToast'
import { useQueryClient } from 'react-query'
import { useConfirm } from 'lib/hooks/useConfirm'
import {
    DocumentGray,
    NoteIconGray,
    UserIconGray,
} from 'public/assets/common/icons'
import { useRouter } from 'next/router'

const relativeTime = require('dayjs/plugin/relativeTime')

dayjs.extend(relativeTime)

export default function NotificationCardGrey({ item }) {
    const router = useRouter()
    const { success, error } = useToast()
    const { isConfirmed } = useConfirm()
    const queryClient = useQueryClient()
    const API_delete = useApi(deleteNotification)

    const handleDeleteNotification = async () => {
        if (
            await isConfirmed({
                title: 'Delete notification?',
                description:
                    'Are you sure you want to delete  this notification ?',
                confirmButtonLabel: 'Yes',
                cancelButtonLabel: 'No',
            })
        ) {
            try {
                const res = await API_delete.request(item?._id)
                if (res.isError) {
                    error('Failed to delete this notification.', {
                        type: 'error',
                    })
                } else {
                    success('Notification deleted successfully')
                    // Ensure that `queryClient` is defined and imported
                    queryClient.invalidateQueries(['notifications'])
                }
            } catch (err) {
                console.log(err + ' At handleDeleteNotification')
                error('An error occurred while deleting the notification.', {
                    type: 'error',
                })
            }
        }
    }

    const handleRoute = (entity_type) => {
        switch (entity_type) {
            case 'lead_onboarded':
                return '/admin/leads/recently-added'
            case 'dealer_onboard':
                return '/admin/dealers/all'
            case 'dealer_subscribed':
                return '/admin/dealers/premium'
        }
    }

    return (
        <div className="w-full py-2 flex cursor-pointer">
            <div
                onClick={() => router.push(handleRoute(item?.entity_type))}
                className="w-[calc(100%-74px)] p-5 bg-white shadow-md rounded-md flex items-center"
            >
                <div className="w-[22px] mr-5">
                    {item?.entity_type === 'lead_onboarded' ? (
                        <DocumentGray />
                    ) : item?.entity_type === 'dealer_onboard' ? (
                        <UserIconGray />
                    ) : (
                        <NoteIconGray />
                    )}
                </div>
                <div className="w-[calc(100%-38px)]">
                    <h2 className="text-grey font-[600] text-[16px]">
                        {item?.meta?.title}
                    </h2>
                    <p
                        dangerouslySetInnerHTML={{
                            __html: item?.meta?.body.replace('undefined-', ''),
                        }}
                        className="text-[14px]"
                    />
                    <p className="text-xs opacity-50">
                        {dayjs().to(dayjs(item?.createdAt))}
                    </p>
                </div>
            </div>
            <div className="pl-5">
                <div
                    onClick={handleDeleteNotification}
                    className="w-full h-full p-4 flex justify-center items-center bg-gradient"
                >
                    <img
                        className="w-full"
                        src="/assets/notification/notification-delete.png"
                        alt="Delete Notification"
                    />
                </div>
            </div>
        </div>
    )
}
