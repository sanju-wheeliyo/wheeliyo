import nodemailer from 'nodemailer'

// export const Mailtransporter = nodemailer.createTransport({
//     host: 'gmail',
//     port: 587,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//         user: process.env.NODEMAILER_USER_NAME,
//         pass: process.env.NODEMAILER_PASSWORD,
//     },
// })
// export default { transporter }
export const mailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
})
