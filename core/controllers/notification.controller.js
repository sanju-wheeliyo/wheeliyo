import notificationService from 'core/services/notification.service'
import resUtils from 'core/utils/res.utils'
import { createMessage } from 'core/utils/twilio.utils'
import mongoose from 'mongoose'
const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.query
        const notification = await notificationService.findOne(id)
        if (!notification)
            return resUtils.sendError(
                res,
                400,
                " Provided notification doesn't exit "
            )
        await notificationService.deleteNotification(id)
        return resUtils.sendSuccess(
            res,
            200,
            'Notification deleted successfully'
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const getAllNotification = async (req, res, next) => {
    try {
        const user = req.user
        const { page = 1, limit = 10 } = req.query
        const queryObj = { notifier: user.id, isDeleted: false };
        const { results, count } = await notificationService.findAll(
            mongoose.Types.ObjectId(user.id),
            parseInt(page),
            parseInt(limit)
        )
        const totalPages = Math.ceil(count / limit)
        // const uu = await createMessage()
        // console.log(uu, 'uu')
        const meta = {
            page,
            size: limit,
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(
            res,
            200,
            'Notification fetched successfully',
            results,
            meta
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}
export const ReadSingleNotification = async (req, res, next) => {
    const userId = req.user?._id
    try {
        const { id } = req.query
        await notificationService.markSingleRead(userId, id)
        return resUtils.sendSuccess(res, 200, 'success')
    } catch (error) {
        next(error)
    }
}
const readAllNotifications = async (req, res, next) => {
    try {
        const user = req.user
        await notificationService.readAll(user._id)
        return resUtils.sendSuccess(res, 200, 'Read notification success')
    } catch (error) {
        next(error)
    }
}
const getUnreadCount = async (req, res, next) => {
    try {
        const user = req.user
        const count = await notificationService.unread_count(user._id)
        
        // Only return count if there are unread notifications
        if (count > 0) {
            return resUtils.sendSuccess(res, 200, 'Success', { count })
        } else {
            // Return success without count when there are no unread notifications
            return resUtils.sendSuccess(res, 200, 'Success', {})
        }
    } catch (error) {
        next(error)
    }
}
const createDummyNotification = async (req, res, next) => {
    try {
        const user = req.user
        const Notifications = [
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_1',
                parent_type: 'comment',
                entity_type: 'post',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_2',
                parent_type: 'like',
                entity_type: 'photo',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_3',
                parent_type: 'mention',
                entity_type: 'comment',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_4',
                parent_type: 'message',
                entity_type: 'chat',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_5',
                parent_type: 'friend_request',
                entity_type: 'user',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_6',
                parent_type: 'comment',
                entity_type: 'post',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_7',
                parent_type: 'like',
                entity_type: 'photo',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_8',
                parent_type: 'mention',
                entity_type: 'post',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_9',
                parent_type: 'message',
                entity_type: 'chat',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
            {
                actor: mongoose.Types.ObjectId(), // Replace with actual actor ID if needed
                notifier: user._id, // Example user ID
                parent_id: 'parent_10',
                parent_type: 'friend_request',
                entity_type: 'user',
                read: false,
                isDeleted: false,
                meta: {
                    title: 'New dealer onboarded',
                    body: 'New dealer requires your approval. Visit dealer list and  profile to r…',
                },
            },
        ]
        await notificationService.createNotification(Notifications)
        return resUtils.sendSuccess(res, 200, 'success')
    } catch (error) {
        console.log(error, 'ee')
        next(error)
    }
}
const getAllNewNotification = async (req, res, next) => {
    try {
        const user = req.user
        const { page, size } = req.query
        const pageNumber = parseInt(page) || 1
        const pageSize = parseInt(size) || 10
        const read = false
        const { results, count } = await notificationService.findAll(
            user._id,
            read,
            pageNumber,
            pageSize
        )
        const totalPages = Math.ceil(count / pageSize)
        const meta = {
            page: pageNumber,
            size: pageSize,
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(
            res,
            200,
            'Notification fetched successfully',
            results,
            meta
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const getAllOldNotification = async (req, res, next) => {
    try {
        const user = req.user
        const { page, size } = req.query
        const pageNumber = parseInt(page) || 1
        const pageSize = parseInt(size) || 10
        const read = true

        const { results, count } = await notificationService.findAll(
            user._id,
            read,
            pageNumber,
            pageSize
        )
        const totalPages = Math.ceil(count / pageSize)
        const meta = {
            page: pageNumber,
            size: pageSize,
            totalPages,
            totalCount: count,
        }
        return resUtils.sendSuccess(
            res,
            200,
            'Notification fetched successfully',
            results,
            meta
        )
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export default {
    deleteNotification,
    getAllNotification,
    ReadSingleNotification,
    readAllNotifications,
    getUnreadCount,
    createDummyNotification,
    getAllOldNotification,
    getAllNewNotification,
}
