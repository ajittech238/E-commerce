import { emailDetails } from "../model/emailModel.js"
import { user } from "../model/userModel.js"
import { sendEmail, sendEmails } from "../utils/emailSend.js"
import { ErrorHandler } from "../utils/Errorhandler.js"


export const sendEmailToAllUsers = async (req, res, next) => {
    try {


        const userId = req.user._id
        const { subject, message } = req.body


        if (!subject || !message) {
            return next(new ErrorHandler("subject and message are required!", 400));
        }
        const data = await user.find({}, "email")

        if (!data || data.length === 0) {
            return next(new ErrorHandler("No users found!", 404));
        }
        const emaillist = data.map((item) => item.email)


        await emailDetails.create({
            sentBy: userId,
            emailList: emaillist,
            subject,
            message
        })

        await sendEmails({ bcc: emaillist, subject, message })

        res.status(200).send({
            success: true,
            emaillist,
            message: "email sent successfully !"
        })
    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to send emails !", 500))
    }

}

export const sendEmailTouser = async (req, res, next) => {
    try {

        const userId = req.params.id
        const { subject, message } = req.body || {}

        if (!subject || !message) {
            return next(new ErrorHandler("subject and message are required!", 400));
        }

        const data = await user.findById(userId)

        if (!data || data.length === 0) {
            return next(new ErrorHandler("No users found!", 404));
        }
        const email = data.email

        await emailDetails.create({
            sentBy: userId,
            email,
            subject,
            message
        })

        await sendEmail({ email, subject, message })

        res.status(200).send({
            success: true,
            message: "email send successfully !"
        })
    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to send emails !", 500))
    }

}