import citiesServices from 'core/services/cities.services'
import userServices from 'core/services/user.services'
import resUtils from 'core/utils/res.utils'
import { uploadFile, deleteS3Object } from 'core/utils/storage.utils'
import { v4 as uuidv4 } from 'uuid'
import roleServices from 'core/services/role.services'
import notificationService from 'core/services/notification.service'
import EntityTypes from 'core/constants/entity_types.constants'
import ParentType from 'core/constants/parent_type.constants'

const updateUserProfile = async (req, res, next) => {
    try {
        const user = req.user
        const { name, phone, country_code, city, latitude, longitude } = req.body

        // Get coordinates - either from request or from city lookup
        let finalLatitude = latitude;
        let finalLongitude = longitude;
        
        if (!latitude || !longitude) {
            if (city) {
                const City = (await import('core/models/city')).default;
                const cityDoc = await City.findOne({ name: { $regex: new RegExp(city, 'i') } });
                if (cityDoc && cityDoc.location) {
                    finalLatitude = cityDoc.location.coordinates[1]; // lat is at index 1
                    finalLongitude = cityDoc.location.coordinates[0]; // lng is at index 0
                }
            }
        }

        const updateData = {
            ...(name && { name }),
            ...(phone && { phone }),
            ...(country_code && { country_code }),
            ...(city && { city }),
            ...(finalLatitude && finalLongitude && {
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(finalLongitude), parseFloat(finalLatitude)],
                },
            }),
        }

        await userServices.updateUserById(user.id, updateData)

        return resUtils.sendSuccess(res, 200, 'User profile updated successfully')
    } catch (error) {
        console.error('Error while updating user profile:', error)
        next(error)
    }
}


const uploadUserDocs = async (req, res) => {
    try {
        const userId = req.user.id
        const userPhone = req.user.phone
        const files = req.files

        console.log(
            `Uploading documents for user ID: ${userId}, phone: ${userPhone}`
        )

        const documents = {}
        console.log('docs received:', documents)
        console.log('Files received:', files)

        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']

        const uploadToS3 = async (file, type) => {
            // ✅ Validate file type
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new Error(
                    `Invalid file type for ${type}. Only JPG, JPEG, PNG allowed.`
                )
            }

            const uuid = uuidv4()
            const ext = file.originalname.split('.').pop()
            const s3Key = `user_docs/${userId}/${type}_${uuid}.${ext}`

            await uploadFile(null, s3Key, file.buffer, file.mimetype)

            return {
                s3Key,
                contentType: file.mimetype,
                originalName: file.originalname,
            }
        }

        // ✅ Update keys to match your schema
        if (files?.aadhar_front?.[0]) {
            documents.aadhar_front = await uploadToS3(
                files.aadhar_front[0],
                'aadhar_front'
            )
        }

        if (files?.aadhar_back?.[0]) {
            documents.aadhar_back = await uploadToS3(
                files.aadhar_back[0],
                'aadhar_back'
            )
        }

        if (files?.photo?.[0]) {
            documents.photo = await uploadToS3(files.photo[0], 'photo')
        }

        if (Object.keys(documents).length === 0) {
            return resUtils.sendError(res, 400, 'No documents uploaded')
        }

        const user = await userServices.getUserById(userId)

        // ✅ Assign the updated doc keys
        if (documents.aadhar_front)
            user.documents.aadhar_front = documents.aadhar_front
        if (documents.aadhar_back)
            user.documents.aadhar_back = documents.aadhar_back
        if (documents.photo) user.documents.photo = documents.photo

        user.markModified('documents');
        user.is_KYC_verified = 'pending'; // Set KYC status to pending on submission
        await user.save();

        // Notify all admins about new document upload
        try {
            const adminRole = await roleServices.FindRoleDetailsByName('Admin')
            const admin_notifiers = await userServices.findRoleNotifiers(adminRole._id)
            const notifier_ids = admin_notifiers.map((notifier) => notifier._id)
            
            const uploadedDocTypes = Object.keys(documents)
            
            // Map technical names to user-friendly names
            const docTypeMapping = {
                'aadhar_front': 'Aadhar Front',
                'aadhar_back': 'Aadhar Back', 
                'photo': 'Selfie'
            }
            
            const friendlyDocNames = uploadedDocTypes.map(docType => docTypeMapping[docType] || docType)
            
            const Meta = {
                title: `User uploaded KYC document(s)`,
                body: `User ${user.name} has uploaded document(s): ${friendlyDocNames.join(', ')}. Please verify the documents.`,
            }
            
            const notifications = notifier_ids.map((admin_id) => ({
                actor: userId,
                notifier: admin_id,
                parent_id: userId,
                parent_type: ParentType.User,
                entity_type: EntityTypes.USER_DOCUMENT_STATUS,
                read: false,
                meta: Meta,
                isDeleted: false,
            }))
            await notificationService.createNotification(notifications)
        } catch (notifyErr) {
            console.error('Failed to send admin notification for uploaded user docs:', notifyErr)
        }

        return resUtils.sendSuccess(res, 200, 'Documents uploaded to S3', {
            documents,
        })
    } catch (error) {
        console.error('Error uploading user documents:', error)
        return resUtils.sendError(
            res,
            400,
            error.message || 'Internal server error',
            [{ message: error.message, field: 'file' }]
        )
    }
}

const getUserDocByType = async (req, res) => {
    try {
        const userId = req.user?.id || req._id
        const { type } = req.query // 'aadhar', 'license', or 'photo'

        if (!['aadhar_front', 'aadhar_back', 'photo'].includes(type)) {
            return resUtils.sendError(res, 400, 'Invalid document type')
        }

        const user = await userServices.getUserById(userId)

        if (!user || !user.documents || !user.documents[type]) {
            return resUtils.sendError(res, 404, 'Document not found')
        }

        const document = user.documents[type]

        if (!document.s3Key) {
            return resUtils.sendError(res, 404, 'S3 key not found for document')
        }

        // 🔁 Use AWS SDK directly here with inline setting
        const AWS = await import('aws-sdk')
        const s3 = new AWS.S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            signatureVersion: 'v4',
        })

        const signedUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: document.s3Key,
            Expires: 86400, // 24 hours
            ResponseContentDisposition: 'inline', // 👈 view in browser
        })

        return resUtils.sendSuccess(res, 200, 'Document URL fetched', {
            url: signedUrl,
            contentType: document.contentType,
            originalName: document.originalName,
        })
    } catch (error) {
        console.error('Error fetching user document:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ])
    }
}

const getAllUserDocsStatus = async (req, res) => {
    try {
        const userId = req.user?.id || req._id;
        const user = await userServices.getUserById(userId);
        if (!user || !user.documents) {
            return resUtils.sendError(res, 404, 'No documents found for user');
        }
        const AWS = await import('aws-sdk');
        const s3 = new AWS.S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            signatureVersion: 'v4',
        });
        const docTypes = ['aadhar_front', 'aadhar_back', 'photo'];
        const docs = {};
        for (const type of docTypes) {
            const doc = user.documents[type];
            if (doc && doc.s3Key) {
                const signedUrl = s3.getSignedUrl('getObject', {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: doc.s3Key,
                    Expires: 86400, // 24 hours
                    ResponseContentDisposition: 'inline',
                });
                docs[type] = {
                    ...doc,
                    url: signedUrl,
                };
            } else {
                docs[type] = null;
            }
        }
        return resUtils.sendSuccess(res, 200, 'User documents status fetched', docs);
    } catch (error) {
        console.error('Error fetching all user docs status:', error);
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ]);
    }
}

const getAllUserLeadsDocsStatus = async (req, res) => {
    try {
        const userId = req.user?.id || req._id;
        const leadsServices = (await import('core/services/leads.services')).default;
        const AWS = await import('aws-sdk');
        const s3 = new AWS.S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            signatureVersion: 'v4',
        });
        // Fetch all leads for this user
        const leads = await (await import('core/models/leads')).default.find({ user_id: userId });
        const docTypes = ['rc', 'puc', 'insurance', 'car_front', 'car_back', 'car_left', 'car_right', 'car_interior_front', 'car_frontside_left', 'car_frontside_right', 'car_backside_right', 'car_backside_left', 'car_interior_back', 'odometer', 'service_history'];
        const result = leads.map(lead => {
            const docs = {};
            for (const type of docTypes) {
                const doc = lead.documents?.[type];
                if (doc && doc.s3Key) {
                    const signedUrl = s3.getSignedUrl('getObject', {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: doc.s3Key,
                        Expires: 86400, // 24 hours
                        ResponseContentDisposition: 'inline',
                    });
                    docs[type] = {
                        ...doc,
                        url: signedUrl,
                    };
                } else {
                    docs[type] = null;
                }
            }
            return {
                lead_id: lead._id,
                vehicle: lead.vehicle,
                documents: docs,
            };
        });
        return resUtils.sendSuccess(res, 200, 'User leads documents status fetched', result);
    } catch (error) {
        console.error('Error fetching all user leads docs status:', error);
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ]);
    }
}

const checkEligibilityForPlanPurchase = async (req, res, next) => {
    try {
        const { city } = req.user

        const cities = await citiesServices.getAllCities()
        const found = cities.some((el) => el.name === city)

        let data = {}
        if (found) {
            data = {
                isEligible: true,
            }
        } else {
            data = {
                isEligible: false,
            }
        }
        return resUtils.sendSuccess(
            res,
            200,
            'Eligibility fetched successfully',
            data
        )
    } catch (error) {
        console.log('error while updating user profile::', error)
        next(error)
    }
}
const deleteAccount = async (req, res, next) => {
    try {
        const user = req.user
        
        // Use hard delete to completely remove user and all associated data
        const deleteResult = await userServices.hardDeleteUser(user.id)
        
        // Clear session
        req.session = {
            refreshToken: '',
            token: '',
        }
        
        return resUtils.sendSuccess(
            res,
            200,
            'Account and all associated data deleted successfully',
            {
                deletedLeads: deleteResult.deletedLeads,
                message: deleteResult.message
            }
        )
    } catch (error) {
        console.log('Error deleting account:', error)
        next(error)
    }
}

const reuploadUserDocs = async (req, res) => {
    try {
        const userId = req.user.id
        const files = req.files
        const user = await userServices.getUserById(userId)
        if (!user) {
            return resUtils.sendError(res, 404, 'User not found')
        }

        const allowedDocs = ['aadhar_front', 'aadhar_back', 'photo']
        const reuploadedDocs = []

        for (const docType of allowedDocs) {
            if (files?.[docType]?.[0]) {
                // Only allow re-upload if status is rejected
                if (user.documents[docType]?.status !== 'rejected') continue

                const file = files[docType][0]
                
                // Delete old S3 file before uploading new one
                if (user.documents[docType]?.s3Key) {
                    try {
                        await deleteS3Object(user.documents[docType].s3Key)
                        console.log(`✅ Deleted old S3 file for ${docType}:`, user.documents[docType].s3Key)
                    } catch (deleteErr) {
                        console.error(`⚠️ Failed to delete old S3 file for ${docType}:`, deleteErr)
                        // Continue with upload even if deletion fails
                    }
                }

                const uuid = uuidv4()
                const ext = file.originalname.split('.').pop()
                const s3Key = `user_docs/${userId}/${docType}_${uuid}.${ext}`

                await uploadFile(null, s3Key, file.buffer, file.mimetype)

                user.documents[docType] = {
                    s3Key,
                    contentType: file.mimetype,
                    originalName: file.originalname,
                    status: 'pending',
                    rejectionReason: '',
                }
                reuploadedDocs.push(docType)
            }
        }

        if (reuploadedDocs.length === 0) {
            return resUtils.sendError(res, 400, 'No rejected documents re-uploaded')
        }

        user.markModified('documents')
        user.is_KYC_verified = 'pending'
        await user.save()

        // Notify all admins
        try {
            const adminRole = await roleServices.FindRoleDetailsByName('Admin')
            const admin_notifiers = await userServices.findRoleNotifiers(adminRole._id)
            const notifier_ids = admin_notifiers.map((notifier) => notifier._id)
            const Meta = {
                title: `User re-uploaded KYC document(s)`,
                body: `User ${user.name} has re-uploaded document(s): ${reuploadedDocs.join(', ')}. Please review.`,
            }
            const notifications = notifier_ids.map((admin_id) => ({
                actor: userId,
                notifier: admin_id,
                parent_id: userId,
                parent_type: ParentType.User,
                entity_type: EntityTypes.USER_DOCUMENT_STATUS,
                read: false,
                meta: Meta,
                isDeleted: false,
            }))
            await notificationService.createNotification(notifications)
        } catch (notifyErr) {
            console.error('Failed to send admin notification for re-uploaded user docs:', notifyErr)
        }

        return resUtils.sendSuccess(res, 200, 'Rejected documents re-uploaded successfully', { reuploadedDocs })
    } catch (error) {
        console.error('Error re-uploading user documents:', error)
        return resUtils.sendError(res, 500, 'Internal server error', [
            { message: error.message, field: 'system' },
        ])
    }
}

export default {
    updateUserProfile,
    uploadUserDocs,
    getUserDocByType,
    getAllUserDocsStatus,
    getAllUserLeadsDocsStatus,
    checkEligibilityForPlanPurchase,
    deleteAccount,
    reuploadUserDocs,
}
