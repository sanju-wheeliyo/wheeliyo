import nc from 'next-connect'
import { dbConnectMiddleware } from './db.config'

let cronInitialized = false

export default function base() {
    return nc({
        onError: (err, req, res) => {
            console.log('Main Error: ', err)
            res.status(500).json({ error: 'Internal server error' })
        },
        onNoMatch: (req, res) => {
            res.status(404).end('Page not found')
        },
    })
        .use(dbConnectMiddleware)
        .use(async (req, res, next) => {
            // Initialize cron scheduler once on first API call
            if (!cronInitialized) {
                cronInitialized = true
                try {
                    const nodeCronScheduler = require('../../core/helpers/nodeCronHelper')
                    nodeCronScheduler()
                    console.log('Cron scheduler initialized')
                } catch (error) {
                    console.error('Failed to initialize cron scheduler:', error)
                }
            }
            next()
        })
}
