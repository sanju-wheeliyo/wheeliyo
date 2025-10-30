import otp_WA from 'core/models/otp_WA'
import userServices from 'core/services/user.services'

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    try {
        const { phone, otp } = req.body
        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and OTP required' })
        }

        const latestOtp = await otp_WA
            .findOne({ value: phone, valid: true })
            .sort({ createdAt: -1 })

        if (!latestOtp) {
            return res.status(400).json({ error: 'No OTP sent to this number' })
        }

        if (latestOtp.expiresAt < new Date()) {
            latestOtp.valid = false
            await latestOtp.save()
            return res.status(400).json({ error: 'OTP expired' })
        }

        if (latestOtp.otp !== otp) {
            return res.status(401).json({ error: 'Invalid OTP' })
        }

        latestOtp.valid = false
        await latestOtp.save()

        // ✅ Verify user
        const updatedUser = await userServices.updateUserByPhone(phone, {
            is_verified: true,
        })

        const sanitized = await userServices.getSanitizedUserData(
            updatedUser._id
        )

        return res.status(200).json({
            message: 'OTP verified, user registered',
            data: sanitized,
        })
    } catch (error) {
        console.error('OTP verification error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
}
