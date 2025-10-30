export const noSpaceRegex = (value) => {
    return new RegExp(value.replace(/\s/g, '').split('').join('\\s*'), 'ig')
}

export const removeFromArr = (arr, value) => {
    const index = arr.indexOf(value)
    if (index > -1) {
        arr.splice(index, 1)
    }
}
export const addMonths = (start_date, value) => {
    const date = new Date(start_date)
    
    // Testing mode: Set to true for 2-minute expiry, false for normal month expiry
    const TESTING_MODE = false
    
    if (TESTING_MODE) {
        // For testing: Set expiry to 2 minutes instead of months
        date.setMinutes(date.getMinutes() + 2)
        console.log('🧪 TESTING MODE: Subscription will expire in 2 minutes')
    } else {
        // Production mode: Normal month calculation
        const day = date.getDate()
        date.setDate(1)
        date.setMonth(date.getMonth() + value)
        date.setDate(Math.min(day, getDaysInMonth(date)))
    }
    
    return date
}

const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}
export const removeDuplicatesFromArray = (array) => {
    const newArray = Array.from(new Set(array))
    return newArray
}
