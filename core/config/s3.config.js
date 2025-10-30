import AWS from 'aws-sdk'

export const S3_BUCKET = process.env.AWS_BUCKET_NAME
export const REGION = process.env.AWS_REGION

const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY

AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
})

const s3 = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
})

export default s3
