import userServices from 'core/services/user.services'

const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
export const TwilioClient = twilio(accountSid, authToken)

export async function createBulkMessage(numbers) {
    numbers?.forEach((numberObj) => {
        const userName = numberObj?.name
        const number = numberObj?.phone_number
        const websiteLink = process.env.WEBSITE_LINK
        const contentId = process.env.TWILIO_TEMPLATE_ID
        const twilioNumber = process.env.TWILIO_PHONE_NUMBER

        TwilioClient.messages
            .create({
                body: 'Hello there ',
                from: `whatsapp:${twilioNumber}`,
                to: `whatsapp:${number}`,
                contentSid: `${contentId}`,
                contentVariables: JSON.stringify({
                    1: `${userName}`,
                    2: `${websiteLink}`,
                }),
            })
            .then(() => console.log(`Message sent to ${number}`))
            .catch((error) =>
                console.log(error, `Message not sent to ${number}`)
            )
    })
}

export async function SendDialyNewModelNotification(numbers) {
    numbers?.forEach((numberObj) => {
        const number = numberObj.phone;
        const websiteLink = process.env.WEBSITE_LINK
        const contentId = process.env.TWILIO_DIALY_ALERT_TEMPLATE_ID
        const twilioNumber = process.env.TWILIO_PHONE_NUMBER

        TwilioClient.messages
            .create({
                body: 'New Arrival Alert! ',
                from: `whatsapp:${twilioNumber}`,
                to: `whatsapp:${numberObj.country_code + numberObj.phone}`,
                contentSid: `${contentId}`,

                // contentVariables: JSON.stringify(),
            })
            .then(() => console.log(`Message sent to ${numberObj.country_code + numberObj.phone}`))
            .catch((error) =>
                console.log(error, `Message not sent to ${numberObj.country_code + numberObj.phone}`)
            )
    })
}

// createBulkMessage()
