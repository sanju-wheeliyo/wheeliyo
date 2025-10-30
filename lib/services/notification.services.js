import API from 'lib/config/axios.config'

// Get all notifications
export const getAllNotifications = async (params = {}) => {
    const response = await API.get('/notification/get_all', { params })
    return response.data
}

// Get new notifications
export const getNewNotifications = async (params = {}) => {
    const response = await API.get('/notification/new', { params })
    return response.data
}

// Get old notifications
export const getOldNotifications = async (params = {}) => {
    const response = await API.get('/notification/old', { params })
    return response.data
}

// Get unread count
export const getUnreadCount = async (params = {}) => {
    const response = await API.get('/notification/get_all', { params })
    const notifications = response.data.data || []
    return notifications.filter((n) => !n.isRead).length
}

// Mark notification as read
export const readNotification = async (id) => {
    const response = await API.put(`/notification/read/${id}`)
    return response.data
}

// Mark all notifications as read
export const readAllNotifications = async () => {
    const response = await API.put('/notification/read_all')
    return response.data
}

// Delete notification
export const deleteNotification = async (id) => {
    const response = await API.delete(`/notification/delete/${id}`)
    return response.data
}
