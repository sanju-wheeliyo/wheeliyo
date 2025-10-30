const sendSuccess = (
    res,
    status = 200,
    message,
    data = [],
    meta,
    timestamp = new Date()
) => {
    if (data instanceof Buffer) {
        res.status(status).setHeader('content-type', 'application/pdf')
        res.send(data)
    } else {
        res.status(status).json({
            status,
            message,
            data,
            meta,
            timestamp,
        })
    }
}
const sendError = (
    res,
    status = 400,
    message = 'Something went wrong',
    errors = null,
    timestamp = new Date()
) => {
    const formattedErrors = Array.isArray(errors)
        ? errors
        : typeof errors === 'string'
        ? [{ message: errors }]
        : errors
        ? [errors]
        : [{ message }];

    res.status(status).json({
        status,
        message,
        errors: formattedErrors,
        timestamp,
    });
};
const resUtils = {
    sendSuccess,
    sendError,
}
export default resUtils
