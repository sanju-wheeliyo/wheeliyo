import moment from 'moment'
import imageCompression from 'browser-image-compression'

export const errorSetter = (errors, setError) => {
    return errors?.map((error) => {
        setError(error.field, {
            type: 'manual',
            message: error.message,
        })
    })
}

export const extractKilometers = (str) => {
    const regex = /(\d+)-(\d+)/
    const match = str?.match(regex)
    if (match) {
        const minKilometers = parseInt(match[1], 10)
        const maxKilometers = parseInt(match[2], 10)
        return { minKilometers, maxKilometers }
    }
    return { minKilometers: null, maxKilometers: null }
}

export const formatDateDDMMYYYY = (date) => {
    return moment(date).format('DD/MM/YYYY')
}

export const formatDateDDMMYYYYTime = (date) => {
    return moment(date).format('DD/MM/YYYY ' + ' & ' + ' h:mm a')
}

export const Pad = (d) => {
    return d < 10 ? '0' + d.toString() : d.toString()
}

export const FileImage = (imageURL) => {
    // Use the S3 URL from environment variable or fallback to the configured domain
    const s3Url = process.env.NEXT_PUBLIC_AWS_S3_URL || 'https://staging-wheeliyo.s3.us-east-2.amazonaws.com'
    return s3Url + '/' + imageURL
}

export const handleImageCompress = async (imageFile) => {
    const options = {
        maxSizeKB: 100, // Target size in KB
        maxSizeMB: 0.1, // Equivalent to 100 KB
        useWebWorker: true,
    }

    try {
        const compressedFile = await imageCompression(imageFile, options)
        return compressedFile
    } catch (error) {
        console.error('Error during compression:', error)
    }
}

export const handleImageCompressArray = async (imageFiles) => {
    const options = {
        maxSizeKB: 100, // Target size in KB
        maxSizeMB: 0.1, // Equivalent to 100 KB
        useWebWorker: true,
    }

    try {
        const compressedFiles = await Promise.all(
            imageFiles.map(async (imageFile) => {
                // Compress the file
                const compressedBlob = await imageCompression(
                    imageFile,
                    options
                )

                // Convert compressed blob back into File
                const compressedFile = new File(
                    [compressedBlob], // Blob data
                    imageFile.name, // Original file name
                    { type: imageFile.type, lastModified: Date.now() } // File metadata
                )

                return compressedFile // Return the File object
            })
        )
        return compressedFiles // Return array of File objects
    } catch (error) {
        console.error('Error during batch compression:', error)
        throw error // Handle error if needed
    }
}

export const formatToFixed = (d, numbersTobeFixed = 2) => {
    if (!d) return '0.00'
    return Number(d).toFixed(numbersTobeFixed)
}
