import otp from 'core/models/otp'

const creatOtp = async (data) => {
    const result = await otp.create(data)
    return result
}

const makePastOtpsInvalid = async (email) => {
    return await otp.updateMany({ value: email }, { $set: { valid: false } })
}
export const getOtpByEmail = async (email) => {
    const OTP = await otp
        .findOne({ value: email })
        .sort({ createdAt: -1 })
        .limit(1)
    return OTP
}

export const getOtpByPhone = async (value) => {
    const OTP = await otp
        .findOne({ value: value })
        .sort({ createdAt: -1 })
        .limit(1)
    return OTP
}

export default { creatOtp, makePastOtpsInvalid, getOtpByPhone, getOtpByEmail }
