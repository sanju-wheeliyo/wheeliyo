import resUtils from 'core/utils/res.utils'

export const authenticateAdminMiddleware = async (req, res, next) => {
    try {
        const user = req?.user
        if (user?.role?.type !== 'ADMIN') {
            return resUtils.sendError(res, 401, 'Not authorized T_T')
        }
        next()
    } catch (error) {
        resUtils.sendError(res, 400, 'Internal server error o_O')
    }
}
