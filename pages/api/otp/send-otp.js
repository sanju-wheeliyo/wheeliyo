import { Twilio } from 'twilio'
import otp_WA from 'core/models/otp_WA'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioNumber = process.env.TWILIO_PHONE_NUMBER
const client = new Twilio(accountSid, authToken)

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    const { phone } = req.body
    if (!phone) return res.status(400).json({ error: 'Phone is required' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await otp_WA.create({
        value: phone,
        otp,
        type: 'phone',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    })

    try {
        await client.messages.create({
            from: `whatsapp:${twilioNumber}`,
            to: `whatsapp:${phone}`,
            body: `Your OTP code for Wheeliyo is ${otp}. It expires in 5 minutes.`,
        })

        return res.status(200).json({ success: true })
    } catch (error) {
        console.error('Twilio send error:', error)
        return res
            .status(500)
            .json({ error: 'Failed to send OTP', details: error.message })
    }
}
