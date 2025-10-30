import bcrypt from 'bcryptjs'

export const generateHashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}
export const validatePassword = async (password, userPassword) => {
    const isPasswordValid = await bcrypt.compare(password, userPassword)
    return isPasswordValid
}
