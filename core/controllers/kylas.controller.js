import kylasUtils from 'core/utils/kylas.utils'
import resUtils from 'core/utils/res.utils'
const createLead = async (req, res) => {
    try {
        const response = await kylasUtils.createLead(req.body)
        resUtils.sendSuccess(res, 200, 'Lead created successfully', response);
    } catch (e) {
        resUtils.sendError(res, 500, 'No message')
    }
}
const kylasControllers = {
    createLead,
}

export default kylasControllers
