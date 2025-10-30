'use client'

import React from 'react'
import ListingContextProvider from 'lib/hooks/ListingContextProvider'
import { getOldNotifications } from 'lib/services/notification.services'
import Listing from 'lib/utils/Listing'

export default function OldNotification({ NotificationCard }) {
    return (
        <ListingContextProvider
            getItemsAPI={getOldNotifications}
            cacheKey={['old-notifications']}
            noDataMessage="No old notifications found"
            otherParams={{ size: 10 }}
        >
            <div className="flex flex-col gap-1">
                <Listing listingComponent={NotificationCard} />
            </div>
        </ListingContextProvider>
    )
}
