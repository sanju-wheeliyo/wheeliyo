import { mailTransporter } from 'core/config/nodemailer.config'
const ejs = require('ejs')
export const GenerateEmailTemplate = ({
    receivers,
    content,
    subject,
    templatePath,
    websiteLink,
    user_name,
}) => {
    return new Promise((resolve, reject) => {
        const renderTemplate = templatePath
            ? new Promise((resolve, reject) => {
                  ejs.renderFile(
                      templatePath,
                      { receivers, content, websiteLink, user_name },

                      (err, data) => {
                          if (err) {
                              console.log(err, 'ee')

                              reject([])
                          } else {
                              resolve(data)
                          }
                      }
                  )
              })
            : Promise.resolve(`<p>Hello,this is your otp </p><p>${content}</p>`)
        renderTemplate
            .then((data) => {
                const promises = receivers.map((receiver) => {
                    let mailOptions = {
                        from: process.env.MAIL_FROM,
                        to: receiver,
                        subject: subject,
                        html: data,
                    }

                    return new Promise((resolve, reject) => {
                        mailTransporter.sendMail(mailOptions, (error) => {
                            if (error) {
                                console.log(
                                    error,
                                    '===================================='
                                )

                                reject(error)
                            } else {
                                resolve(receiver)
                            }
                        })
                    })
                })
                return Promise.all(promises)
            })
            .then((results) => {
                const successfulEmails = results.filter((email) => email !== '')
                resolve(successfulEmails)
            })
            .catch((error) => {
                console.log(error, 'ee')

                reject([])
            })
    })
}
