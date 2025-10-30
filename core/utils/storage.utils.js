import fs from 'fs'
import multer from 'multer'
import s3, { S3_BUCKET, REGION } from 'core/config/s3.config'
import AWS from 'aws-sdk'
import path from 'path'
const uploadParams = {
    Bucket: S3_BUCKET,
    Expires: 86400,
}
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir) // ensure the 'uploads' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname) // or a more unique name if needed
    },
})

export const upload = multer({ storage })

//The uploadFile function
export async function uploadFile(
    source, //file path
    targetName, //s3 key
    buffer,
    contentType
) {
    return new Promise((resolve, reject) => {
        if (buffer) {
            const putParams = {
                Bucket: S3_BUCKET,
                Key: targetName,
                Body: buffer,
                ContentType: contentType,
                ACL: 'public-read',
            }

            //upload in to s3
            s3.putObject(putParams, function (err, data) {
                if (err) {
                    console.log('Error while uploading:', err)
                    return reject(false)
                } else {
                    console.log('Original image upload success', data)
                    return resolve(true)
                }
            })
        } else {
            fs.readFile(source, async function (err, filedata) {
                if (!err) {
                    const putParams = {
                        Bucket: S3_BUCKET,
                        Key: targetName,
                        Body: filedata,
                        ContentType: contentType,
                        ACL: 'public-read',
                    }
                    s3.putObject(putParams, function (err, data) {
                        if (err) {
                            console.log('Error while uploading:', err)
                            return reject(false)
                        } else {
                            console.log(
                                'compression image upload success',
                                data
                            )
                            return resolve(true)
                        }
                    })
                } else {
                    console.log(
                        err,
                        'Error from readFile function in upload function'
                    )
                    return reject(false)
                }
            })
        }
    })
}

//The retrieveFile function
export const retrieveFile = {
    object: function (Key) {
        s3.getObject({ ...uploadParams, Key }, function (err, data) {
            if (err) {
                return console.log(err)
            } else {
                return data.Body
            }
        })
    },
    signed: function (Key) {
        if (!Key) {
            console.warn('⚠️ Signed URL generation: Key is missing')
            return null
        }
        try {
            // Create a new S3 instance with explicit signature version for signed URLs
            // This ensures compatibility and proper URL generation
            const s3ForSignedUrl = new AWS.S3({
                region: REGION,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                signatureVersion: 'v4',
            })

            // Generate signed URL with proper parameters
            const params = {
                Bucket: S3_BUCKET,
                Key: Key,
                Expires: 86400, // 24 hours
            }

            const signedUrl = s3ForSignedUrl.getSignedUrl('getObject', params)
            console.log(
                '✅ Generated signed URL for:',
                Key.substring(0, 50) + '...'
            )
            return signedUrl
        } catch (error) {
            console.error(
                '❌ Error generating signed URL for',
                Key,
                ':',
                error.message
            )
            // Fallback to direct S3 URL if signed URL generation fails
            return `${process.env.AWS_S3_URL}/${Key}`
        }
    },
    publicUrl: (key) => `${process.env.AWS_S3_URL}/${key}`,
    compressedUrl: (key) => `${process.env.AWS_S3_URL}/optimized/${key}`,
}

export async function deleteS3Object(key) {
    const params = {
        Bucket: S3_BUCKET, // Specify your bucket name
        Key: key, // Specify the key of the object you want to delete
    }

    try {
        await s3.deleteObject(params).promise()
    } catch (error) {
        console.error(`Error deleting object with key ${key}:`, error)
        throw error // Propagate the error to the caller if needed
    }
}
// export const compressImageAndUpload = async ({ filePath, compressKey }) => {
//     await sharp(filePath)
//         .resize(1000)
//         .jpeg({ progressive: true, force: false, quality: 80 })
//         .png({ progressive: true, force: false, quality: 80 })
//         .withMetadata()
//         .toBuffer()
//         .then((data) => {
//             uploadFile(undefined, compressKey, data)
//         })
//         .catch((err) => {
//             console.log(err, 'compress image error')
//         })
// }
