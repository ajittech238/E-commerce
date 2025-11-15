import {google} from 'googleapis'
import nodeMailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
)

if(process.env.GMAIL_ACCESS_TOKEN){
    oauth2Client.setCredentials({refresh_token : process.env.GMAIL_ACCESS_TOKEN})
}
else{
    console.log("REFRESH token is missing ...")
}


const getAccessToken = async()=>{
    try{

        const {token} = await oauth2Client.getAccessToken()
    
        if(!token){
            console.log("failed to access token")
        }
    
        return token
    }
    catch(err){
        console.log("failed to retrive token", err)
    }

}

export const sendEmail = async ({email, subject, message})=>{
        try{
                const accessToken = await getAccessToken()

                const transporter = nodeMailer.createTransport({
                    service : process.env.SMTP_SERVICE,
                    auth : {
                        type : "OAuth2",
                        user : process.env.SMTP_USER,
                        clientId : process.env.GMAIL_CLIENT_ID,
                        clientSecret : process.env.GMAIL_CLIENT_SECRET,
                        refreshToken : process.env.GMAIL_ACCESS_TOKEN,
                        accessToken : accessToken,

                    }
                })
                const mailoption = {
                    from : process.env.SMTP_MAIL,
                    to : email,
                    subject : subject,
                    html : message,
                }
            
                const info = await transporter.sendMail(mailoption)

                console.log("email send successfully ", info.messageId)



        }
        catch(err){
            console.error("error sending email", err)
        }
    }


export const sendEmails = async ({bcc, subject, message})=>{
        try{
                const accessToken = await getAccessToken()

                const transporter = nodeMailer.createTransport({
                    service : process.env.SMTP_SERVICE,
                    auth : {
                        type : "OAuth2",
                        user : process.env.SMTP_USER,
                        clientId : process.env.GMAIL_CLIENT_ID,
                        clientSecret : process.env.GMAIL_CLIENT_SECRET,
                        refreshToken : process.env.GMAIL_ACCESS_TOKEN,
                        accessToken : accessToken,

                    }
                })
                const mailoption = {
                    from : process.env.SMTP_MAIL,
                    to :  process.env.SMTP_USER,
                    bcc : bcc,
                    subject : subject,
                    html : message,
                }
            
                const info = await transporter.sendMail(mailoption)

                console.log("email send successfully ", info.messageId)



        }
        catch(err){
            console.error("error sending email", err)
        }
    }



