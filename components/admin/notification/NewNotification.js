'use client'

import React from 'react'
import ListingContextProvider from 'lib/hooks/ListingContextProvider'
import { getNewNotifications } from 'lib/services/notification.services'
import Listing from 'lib/utils/Listing'

export default function NewNotification({ NotificationCard }) {
    return (
        <ListingContextProvider
            getItemsAPI={getNewNotifications}
            cacheKey={['new-notifications']}
            noDataMessage="No new notifications found"
            otherParams={{ size: 10 }}
        >
            <div className="flex flex-col gap-1">
                <Listing listingComponent={NotificationCard} />
            </div>
        </ListingContextProvider>
    )
}
