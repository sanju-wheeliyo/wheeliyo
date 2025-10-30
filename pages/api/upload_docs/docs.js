// pages/api/upload_docs/docs.js
import multer from 'multer'
import nextConnect from 'next-connect'
import path from 'path'
import fs from 'fs'
import dbConnect from 'core/config/db.config'
import Leads from 'core/models/leads' // ✅ import your model
import mongoose from 'mongoose'

const uploadDir = path.join(process.cwd(), 'uploads')

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
}

const storage = multer.memoryStorage()

const upload = multer({ storage: storage })

// ✅ define apiRoute BEFORE using it
const apiRoute = nextConnect({
    onError(error, req, res) {
        res.status(501).json({ error: `Upload error: ${error.message}` })
    },
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    },
})

apiRoute.use(
    upload.fields([
        { name: 'rc', maxCount: 1 },
        { name: 'puc', maxCount: 1 },
        { name: 'insurance', maxCount: 1 },
        { name: 'car_front', maxCount: 1 },
        { name: 'car_back', maxCount: 1 },
        { name: 'car_left', maxCount: 1 },
        { name: 'car_right', maxCount: 1 },
        { name: 'car_interior_front', maxCount: 1 },
        { name: 'car_frontside_left', maxCount: 1 },
        { name: 'car_frontside_right', maxCount: 1 },
        { name: 'car_backside_right', maxCount: 1 },
        { name: 'car_backside_left', maxCount: 1 },
        { name: 'car_interior_back', maxCount: 1 },
        { name: 'odometer', maxCount: 1 },
        { name: 'service_history', maxCount: 1 },
    ])
)

apiRoute.post(async (req, res) => {
    try {
        await dbConnect()

        const { leadId } = req.body
        const files = req.files

        const updatedLead = await Leads.findByIdAndUpdate(
            leadId,
            {
                documentStatus: 'pending', // Set to pending when documents are uploaded
                leadApprovalStatus: 'pending', // Set to pending when documents are uploaded
                documents: {
                    rc: files?.rc?.[0]
                        ? {
                            data: files.rc[0].buffer,
                            contentType: files.rc[0].mimetype,
                        }
                        : undefined,
                    puc: files?.puc?.[0]
                        ? {
                            data: files.puc[0].buffer,
                            contentType: files.puc[0].mimetype,
                        }
                        : undefined,
                    insurance: files?.insurance?.[0]
                        ? {
                            data: files.insurance[0].buffer,
                            contentType: files.insurance[0].mimetype,
                        }
                        : undefined,
                    car_front: files?.car_front?.[0]
                        ? {
                            data: files.car_front[0].buffer,
                            contentType: files.car_front[0].mimetype,
                        }
                        : undefined,
                    car_back: files?.car_back?.[0]
                        ? {
                            data: files.car_back[0].buffer,
                            contentType: files.car_back[0].mimetype,
                        }
                        : undefined,
                    car_left: files?.car_left?.[0]
                        ? {
                            data: files.car_left[0].buffer,
                            contentType: files.car_left[0].mimetype,
                        }
                        : undefined,
                    car_right: files?.car_right?.[0]
                        ? {
                            data: files.car_right[0].buffer,
                            contentType: files.car_right[0].mimetype,
                        }
                        : undefined,
                    car_interior_front: files?.car_interior_front?.[0]
                        ? {
                            data: files.car_interior_front[0].buffer,
                            contentType: files.car_interior_front[0].mimetype,
                        }
                        : undefined,
                    car_frontside_left: files?.car_frontside_left?.[0]
                        ? {
                            data: files.car_frontside_left[0].buffer,
                            contentType: files.car_frontside_left[0].mimetype,
                        }
                        : undefined,
                    car_frontside_right: files?.car_frontside_right?.[0]
                        ? {
                            data: files.car_frontside_right[0].buffer,
                            contentType: files.car_frontside_right[0].mimetype,
                        }
                        : undefined,
                    car_backside_right: files?.car_backside_right?.[0]
                        ? {
                            data: files.car_backside_right[0].buffer,
                            contentType: files.car_backside_right[0].mimetype,
                        }
                        : undefined,
                    car_backside_left: files?.car_backside_left?.[0]
                        ? {
                            data: files.car_backside_left[0].buffer,
                            contentType: files.car_backside_left[0].mimetype,
                        }
                        : undefined,
                    car_interior_back: files?.car_interior_back?.[0]
                        ? {
                            data: files.car_interior_back[0].buffer,
                            contentType: files.car_interior_back[0].mimetype,
                        }
                        : undefined,
                    odometer: files?.odometer?.[0]
                        ? {
                            data: files.odometer[0].buffer,
                            contentType: files.odometer[0].mimetype,
                        }
                        : undefined,
                    service_history: files?.service_history?.[0]
                        ? {
                            data: files.service_history[0].buffer,
                            contentType: files.service_history[0].mimetype,
                        }
                        : undefined,
                },
            },
            { new: true }
        )

        res.status(200).json({
            message: 'Files uploaded and stored in MongoDB',
            lead: updatedLead,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Server error' })
    }
})

export const config = {
    api: {
        bodyParser: false,
    },
}

export default apiRoute
