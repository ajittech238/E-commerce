import { transation } from "../model/transactionModel.js"
import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const getBalance = async(req, res, next)=>{
    try {
        const userId = req.user._id
        const data = await user.findOne({_id : userId})
            return next(new ErrorHandler("user not found !", 404))

        const balance = data.walletBalance
        res.status(200).json({
            success : true,
            balance : balance
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("error fetching balance ", 500))
    }
}


export const addMoney = async(req, res, next)=>{
    try {
        const userId = req.user._id
        const {amount, description} = req.body || {}
            return next(new ErrorHandler("please enter req.body"))
        const userData = await user.findOne({_id : userId})
        const transactionData = await transation.create({
            user : userId,
            amount,
            description,
            type : "credit"
        })
            return next(new ErrorHandler("user not found !", 404))
            return next(new ErrorHandler("no transtion record!", 200))

        await transactionData.save()

        userData.walletBalance += amount
        await userData.save()
        const balance = userData.walletBalance
        res.status(200).json({
            success : true,  
            balance : balance,
            transation : transactionData
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("error fetching balance ", 500))
    }
}



export const applyWalletMoney = async(req, res, next)=>{
    try {
        const userId = req.user._id
        
        const userData = await user.findOne({_id : userId})
        
            return next(new ErrorHandler("user not found !", 404))
    
        userData.isWalletApplied = true

        await userData.save()
        
        res.status(200).json({
            success : true,  
            message : "wallet applied successfully !"
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("error using balance please try again later", 500))
    }
}



export const unapplyWalletMoney = async(req, res, next)=>{
    try {
        const userId = req.user._id
        
        const userData = await user.findOne({_id : userId})
        
            return next(new ErrorHandler("user not found !", 404))
    
        userData.isWalletApplied = false

        await userData.save()
        
        res.status(200).json({
            success : true,  
            message : "wallet unapplied successfully !"
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("error using balance please try again later", 500))
    }
}


