import resUtils from 'core/utils/res.utils'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return resUtils.sendError(res, 405, 'Method Not Allowed')
    }

    try {
        // For admin logout, we just need to return success
        // The client will handle clearing localStorage and redirecting
        return resUtils.sendSuccess(res, 200, 'Admin logout successful')
    } catch (error) {
        console.error('Admin logout error:', error)
        return resUtils.sendError(res, 500, 'Internal server error')
    }
}
