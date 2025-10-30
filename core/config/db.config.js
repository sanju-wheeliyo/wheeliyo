// /lib/dbConnect.js
import { MONGODB_URI } from 'core/constants/db.constants'
import mongoose from 'mongoose'

/** 
Source : 
https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/utils/dbConnect.js 
**/

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }

        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('[*] DB Connected successfully to:', MONGODB_URI)

                // Handle connection events
                mongoose.connection.on('error', (err) => {
                    console.error('❌ MongoDB connection error:', err)
                    cached.conn = null
                    cached.promise = null
                })

                mongoose.connection.on('disconnected', () => {
                    console.warn('⚠️ MongoDB disconnected')
                    cached.conn = null
                    cached.promise = null
                })

                mongoose.connection.on('reconnected', () => {
                    console.log('✅ MongoDB reconnected')
                })

                return mongoose
            })
            .catch((error) => {
                console.error('❌ MongoDB connection failed:', error)
                cached.promise = null
                throw error
            })
    }

    try {
        cached.conn = await cached.promise
        return cached.conn
    } catch (error) {
        cached.promise = null
        cached.conn = null
        throw error
    }
}

export default dbConnect

export const ensureConnection = async () => {
    if (mongoose.connection.readyState !== 1) {
        console.log('🔄 Connection not ready, attempting to connect...')
        await dbConnect()
    }
    return true
}

export const dbConnectMiddleware = async (req, res, next) => {
    try {
        await dbConnect()
        next()
    } catch (error) {
        console.error('❌ Database connection middleware error:', error)
        // Reset connection cache on error
        cached.conn = null
        cached.promise = null

        // Try to reconnect
        try {
            await dbConnect()
            next()
        } catch (retryError) {
            console.error('❌ Database reconnection failed:', retryError)
            res.status(500).json({
                error: 'Database connection failed',
                message: 'Please try again in a moment',
            })
        }
    }
}
