import subscription from 'core/models/subscription'
import notificationService from 'core/services/notification.service'
import ParentType from 'core/constants/parent_type.constants'
import EntityTypes from 'core/constants/entity_types.constants'

// Testing mode: Set to true for minute-level expiry checks, false for production
const TESTING_MODE = false

export async function updateSubsriptionStatus() {
    const subscriptions = await subscription.find({
        status: { $ne: 'EXPIRED' },
    })

    for (const sub of subscriptions) {
        const currentDate = new Date()
        const expiryDate = new Date(sub.end_date)

        if (TESTING_MODE) {
            // Testing mode: Check at minute precision for 2-minute expiry
            if (currentDate > expiryDate) {
                console.log('🧪 TESTING MODE: Subscription expired at minute level:', sub._id)
                
                if (sub.status !== 'EXPIRED') {
                    await subscription.updateOne(
                        { _id: sub._id },
                        {
                            $set: { status: 'EXPIRED' },
                        }
                    )
                }
            }
        } else {
            // Production mode: Check at day level (original logic)
            currentDate.setUTCHours(0, 0, 0, 0)
            expiryDate.setUTCHours(0, 0, 0, 0)

            if (currentDate > expiryDate) {
                if (sub.status !== 'EXPIRED') {
                    await subscription.updateOne(
                        { _id: sub._id },
                        {
                            $set: { status: 'EXPIRED' },
                        }
                    )
                }
            } else {
                const timeDiff = Math.abs(
                    expiryDate.getTime() - currentDate.getTime()
                )
                const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))
                if (
                    diffDays <= 3 &&
                    (sub.expireNotificationSent === false ||
                        sub.expireNotificationSent === undefined)
                ) {
                    const Meta = {
                        title: `Plan expiring soon `,
                        body: `Your Dealer Premium plan expiring soon. Please update your plan`,
                    }
                    const notification = {
                        actor: null,
                        notifier: sub.user_id,
                        parent_id: sub._id,
                        parent_type: ParentType.SUBSCRIPTION,
                        entity_type: EntityTypes.PLAN_EXPIRING_SOON,
                        read: false,
                        meta: Meta,
                        isDeleted: false,
                    }

                    await notificationService.createNotification(notification)
                    await subscription.updateOne(
                        { _id: sub._id },
                        {
                            $set: { expireNotificationSent: true },
                        }
                    )
                }
            }
        }
    }
}
