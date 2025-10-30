import Notification from 'core/models/notification'
import mongoose from 'mongoose'

const createNotification = async (data) => {
    const result = await Notification.create(data)
    return result
}
const deleteNotification = async (id) => {
    return await Notification.updateOne({ _id: id }, { isDeleted: true })
}
const findOne = async (id) => {
    return await Notification.findOne({ _id: id })
}
const findAll = async (userId, read, page, limit) => {
    const query = {
        notifier: userId,
        actor: { $ne: userId },
        isDeleted: false,
    }

    if (typeof read === 'boolean') {
        query.read = read
    }

    // console.log('Final MongoDB Query:', query)

    const [results, count] = await Promise.all([
        Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Notification.countDocuments(query),
    ])

    return {
        results,
        count,
    }
}
export const markSingleRead = async (userId, notificationId) => {
    return await Notification.updateMany(
        {
            $and: [
                { notifier: userId },
                { _id: notificationId },
                { read: false },
            ],
        },
        {
            $set: {
                read: true,
            },
        }
    )
}
const readAll = async (userId) => {
    return await Notification.updateMany(
        {
            notifier: mongoose.Types.ObjectId(userId),
        },
        {
            read: true,
        }
    )
}
const unread_count = async (userId) => {
    return await Notification.count({
        notifier: mongoose.Types.ObjectId(userId),
        read: false,
    })
}
export default {
    createNotification,
    deleteNotification,
    findOne,
    findAll,
    markSingleRead,
    readAll,
    unread_count,
}
