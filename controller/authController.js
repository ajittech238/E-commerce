import { sendToken } from "../utils/sendToken.js";
import { user } from "../model/userModel.js";
import bcrypt from 'bcrypt'
import { order } from "../model/orderModel.js";
import { wishlist } from "../model/wishlistModel.js";
import { client, googleresponse } from "../utils/googletoken.js";
import { sendEmail } from "../utils/emailSend.js";
import crypto from 'crypto'
import { ErrorHandler } from "../utils/Errorhandler.js";
import { refer } from "../model/refer&earnModel.js";
import { config } from "dotenv";
config()



export const userRegister = async (req, res, next) => {
    try {

        const { userName, email, password, phoneNumber,role } = req.body;

        const referlink = req.query.ref

        let data = await user.findOne({ email })

        if (data) {
            return next(new ErrorHandler("user alredy exits !", 406))
        }
        const hashPassword = await bcrypt.hash(password, 10)
        data = await user.create({
            userName,
            email,
            password: hashPassword,
            phoneNumber,
            role
        })


        await data.save()

        if (referlink) {
            const referdata = await user.findOne({ referlink: referlink })

            if (referdata) {
                data.isRefered = true
                data.referedby = referdata._id

                const referuserIddata = await refer.findOne({ referUserId: referdata._id })
                let referalcash = 0
                const referusercash = await user.findOne({ _id: referdata._id })

                await data.save()
                if (!referuserIddata) {
                    referalcash = 100
                    const refermodeldata = await refer.create({
                        referUserId: referdata._id,
                        userInvited: [
                            {
                                userId: data._id
                            }
                        ],
                        inviteCount: 1,
                        totalearning: referalcash
                    })
                    await refermodeldata.save()
                }
                else {

                    if (referuserIddata.inviteCount >= 1) {
                        referalcash = 25

                    }
                    else {
                        referalcash = 100
                    }

                    referusercash.walletBalance += referalcash

                    referuserIddata.inviteCount += 1
                    referuserIddata.totalearning += referalcash
                    referuserIddata.userInvited.push({
                        userId: data._id
                    })

                    await referuserIddata.save()

                }

                await referusercash.save()
            }
        }
        sendToken(data, 201, "user registered successfully", req, res)

    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}




export const googleLogin = async (req, res, next) => {
    try {
        const code = req.query.code
        const data = await googleresponse(code)
        const { name, email } = data
        console.log("name", name)
        console.log("email", email)


        let mydata = await user.findOne({ email })

        mydata = await user.create({
            userName: name,
            email
        })

        if (mydata.isbanned) {
            return (next(new ErrorHandler("user is banned please contact to support . ", 401)))
        }

        sendToken(mydata, 200, "user login successfully", req, res)
    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler("login failed !", 403))
    }

}

export const googleurl = async (req, res, next) => {
    try {

        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email']
        })

        res.redirect(url)
    }
    catch (err) {
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}


export const userLogin = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("required fields missing!", 400))
        }

        const data = await user.findOne({ email }).select("+password")


        if (!data) {
            return next(new ErrorHandler("user doesn't exist!", 404))
        }
        // return next(new ErrorHandler("please reset password ! for this login method", 400))

        if (data.isbanned) {
            return (next(new ErrorHandler("user is banned please contact to support . ", 401)))
        }
        if (data.isdisable) {
            return (next(new ErrorHandler("your id is disabled contact to support . ", 401)))
        }



        const isPasswordMatched = await bcrypt.compare(password, data.password)


        if (!isPasswordMatched) {
            return next(new ErrorHandler("invalid email or password", 400))
        }

        sendToken(data, 200, "login successfully", req, res)

    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}


export const getUser = async (req, res, next) => {
    try {
        const user = req.user

        res.status(200).send({
            success: true,
            user
        })
    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}

export const userLogout = (req, res, next) => {
    try {
        const isLocalhost = req.headers.origin && req.headers.origin.includes("localhost");
        res.status(200).cookie("token", "", {
            expires: new Date(Date.now()),
            httpOnly: false,
            secure: !isLocalhost,
            sameSite: isLocalhost ? "Lax" : "None",
            path: "/"
        }).json({
            success: true,
            message: "logout successfully !"
        })
    }
    catch (err) {
        return next(new ErrorHandler("something went wrong !", 500))
    }
}


export const userProfile = async (req, res, next) => {
    try {
        const userId = req.user._id
        console.log(userId)
        let userdata = await user.findById(userId).select("userName email phoneNumber address")

        if (!userId) {
            return next(new ErrorHandler("User not authenticated", 401));
        }
        res.status(200).send({
            success: true,
            userdata
        })


    }
    catch (err) {
        return next(new ErrorHandler("Error getting profile data", 500))
    }
}



export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user._id
        if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

        const { userName, email, address, phoneNumber } = req.body

        if (!userName && !email && !address && !phoneNumber) {
            return next(new ErrorHandler("please fill the fields", 400))
        }

        const data = {}

        if (userName) data.userName = userName
        if (email) data.email = email
        if (address) data.address = address
        if (phoneNumber) data.phoneNumber = phoneNumber

        let userdata = await user.findByIdAndUpdate(userId, {
            $set: data
        }, { new: true }).select("+phoneNumber")

  if (!userdata) {
      return next(new ErrorHandler("User not found", 404));
    }
        res.status(200).send({
            success: true,
            userdata
        })


    }
    catch (err) {
        return next(new ErrorHandler("Error getting profile data", 500))
    }
}


export const getStates = async (req, res, next) => {
    try {
        const userId = req.user._id

        const totalOrder = await order.countDocuments({ user: userId })

        const totalList = await wishlist.findOne({ userId })

        const totalfav = totalList ? totalList.items.length : 0

        res.status(200).json({
            success: true,
            states: {
                totalOrder: totalOrder,
                totalfav: totalfav
            }

        })
    }
    catch (err) {
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}



export const forgetPassword = async (req, res, next) => {
    try {

        const { email } = req.body || {}

        if (!email) {
            return next(new ErrorHandler("Please enter an email.", 400));
        }
        const data = await user.findOne({ email })

        if (!data) {
            return next(new ErrorHandler("Please enter a valid email.", 400));
        }
        if (data.isbanned) {
            return (next(new ErrorHandler("user is banned please contact to support . ", 401)))
        }

        const resetPasswordToken = data.generateResetPasswordToken()

        await data.save({
            validateBeforeSave: false
        })

        const resetpasswordUrl = `${process.env.FRONTEND_URL}/api/v1/auth/reset/${resetPasswordToken}`

        await sendEmail({ email: email, subject: "reset password", message: `<h1>${resetpasswordUrl}<h1/>` })

        res.status(200).json({
            success: true,
            message: `email sent to ${email} successfully`
        })

    }
    catch (err) {
        console.error(err)
        if (data) {
            data.resetPasswordToken = undefined,
                data.resetPasswordTokenExpire = undefined,
                await data.save({ validateBeforeSave: false })
        }
        return next(new ErrorHandler("failed to send email", 500))

    }
}


export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmNewPassword } = req.body;

        if (!token || !newPassword || !confirmNewPassword) {
            return next(new ErrorHandler("Please enter all required fields!", 400));
        }
        if (newPassword !== confirmNewPassword) {
            return next(new ErrorHandler("password doesn't match !", 400))
        }

        if (newPassword.length < 8) {
            return next(new ErrorHandler("password must be 8 character", 400))
        }

        const resetPasswordToken = await crypto.createHash('sha256').update(token).digest('hex')
        const data = await user.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordTokenExpire: { $gte: Date.now() }
        }).select("+password")

        if (!data) {
            return next(
                new ErrorHandler("Invalid token or token has expired!", 400)
            );
        }
        if (data.isbanned) {
            return (next(new ErrorHandler("user is banned please contact to support . ", 403)))
        }

        const password = await bcrypt.hash(newPassword, 10)

        data.password = password;
        data.resetPasswordToken = undefined;
        data.resetPasswordTokenExpire = undefined;

        await data.save({ validateBeforeSave: false })

        res.status(200).json({
            success: true,
            message: `password changed successfully !`
        })

    }
    catch (err) {
        if (data) {
            data.resetPasswordToken = undefined,
                data.resetPasswordTokenExpire = undefined,
                await data.save({ validateBeforeSave: false })
        }
        return next(new ErrorHandler("failed to reset password", 500))

    }
}

export const updatePassword = async (req, res, next) => {
    try {

        const userId = req.user._id
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
       
        if (!oldPassword || !newPassword || !confirmNewPassword) {
      return next(new ErrorHandler("Please fill all password fields", 400));
    }

        const data = await user.findById({ _id: userId }).select("+password")
    if (!data) {
      return next(new ErrorHandler("User not found", 404));
    }

        const oldHasPassword = await bcrypt.compare(oldPassword, data.password)
         if (!oldHasPassword) {
      return next(new ErrorHandler("Old password is invalid", 400));
    }

        if (newPassword !== confirmNewPassword) {
            return next(new ErrorHandler("password not matched !", 400))
        }

        if (newPassword.length < 8) {
            return next(new ErrorHandler("password must be 8 character", 400))
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        data.password = hashPassword
        
        await data.save()

        res.send({
            message: "Password updated successfully!",
            success: true,
            data
        })

    }
    catch (err) {
        return next(new ErrorHandler("failed to change password !", 500))
    }

}