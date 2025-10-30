const cron = require('node-cron')
const axios = require('axios').default
const cronUrl = "http://app:8010"

// Testing mode: Set to true for frequent expiry checks, false for production
const TESTING_MODE = false

function main() {
    if (TESTING_MODE) {
        // Testing mode: Check expiry every minute for 2-minute testing
        cron.schedule('* * * * *', async () => {
            try {
                console.log('🧪 TESTING MODE: Running check_expiry cron job every minute')
                await axios.post(cronUrl + '/api/cron/check_expiry')
                console.log('🧪 TESTING MODE: check_expiry cron job finished')
            } catch (e) {
                console.log('🧪 TESTING MODE: check_expiry cron job error:', e.message)
            }
        })
        console.log('🧪 TESTING MODE: Cron job scheduled to run every minute')
    } else {
        // Production mode: Run once per day at midnight
        cron.schedule('0 0 * * *', async () => {
            try {
                console.log('running check_expiry cron job')
                await axios.post(cronUrl + '/api/cron/check_expiry')
                console.log('check_expiry cron job finished')
            } catch (e) {
                console.log(e.message)
            }
        })
        console.log('Production mode: Cron job scheduled to run daily at midnight')
    }

    cron.schedule('0 20 * * *', async () => {
        try {
            console.log('running dialy_notification cron job')
            await axios.post(cronUrl + '/api/cron/dialy_notification')
            console.log('dialy_notification cron job finished')
        } catch (e) {
            console.log(e.message)
        }
    }, {
        timezone: "Asia/Kolkata"
    })
}
module.exports = main
