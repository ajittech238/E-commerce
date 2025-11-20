import { transation } from "../model/transactionModel.js"
import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const getBalance = async (req, res, next) => {
    try {
        const userId = req.user._id
        const data = await user.findOne({ _id: userId })
        if (!data) {
            return next(new ErrorHandler("User not found!", 404));
        }
        const balance = data.walletBalance
        res.status(200).json({
            success: true,
            balance: balance
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("error fetching balance ", 500))
    }
}


export const addMoney = async (req, res, next) => {
    try {
        const userId = req.user._id
        const { amount, description } = req.body || {}
        if (!amount || amount <= 0) {
            return next(new ErrorHandler("Amount is required & must be positive.", 400));
        }
        const userData = await user.findOne({ _id: userId })
        if (!userData) {
            return next(new ErrorHandler("User not found!", 404));
        }

        const transactionData = await transation.create({
            user: userId,
            amount,
            description,
            type: "credit"
        })

        //    if(!transactionData){
        //                 return next(new ErrorHandler("no transtion record!", 200))

        //    }

        await transactionData.save()

        userData.walletBalance += amount
        await userData.save()
        const balance = userData.walletBalance
        res.status(200).json({
            success: true,
            balance: balance,
            transation: transactionData
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("error fetching balance ", 500))
    }
}



export const applyWalletMoney = async (req, res, next) => {
    try {
        const userId = req.user._id

        const userData = await user.findOne({ _id: userId })

        if (!userData) {
            return next(new ErrorHandler("User not found!", 404));
        }
        userData.isWalletApplied = true

        await userData.save()

        res.status(200).json({
            success: true,
            message: "wallet applied successfully !"
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("error using balance please try again later", 500))
    }
}



export const unapplyWalletMoney = async (req, res, next) => {
    try {
        const userId = req.user._id

        const userData = await user.findOne({ _id: userId })

        if (!userData) {
            return next(new ErrorHandler("User not found!", 404));
        }
        userData.isWalletApplied = false

        await userData.save()

        res.status(200).json({
            success: true,
            message: "wallet unapplied successfully !"
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("error using balance please try again later", 500))
    }
}


