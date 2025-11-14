import mongoose from "mongoose"
import { ErrorHandler } from "../utils/Errorhandler.js"
import { returnRefund } from "../model/returnRefundModel.js"
import { RazorpayInstance } from "../services/razorpayInstance.js"
import { order } from "../model/orderModel.js"
import { user } from "../model/userModel.js"


export const refundPaymentToWallet = async (req, res, next)=>{
    try{
        
        const {requestId} = req.body

        const returnRefundData = await returnRefund.findOne({_id : requestId})

            return next(new ErrorHandler("no return data and refund found !", 404))

        const {userId, orderId} = returnRefundData

            return next(new ErrorHandler("invalid requestId", 400))

        let userData = await user.findOne({_id : userId})

            return next(new ErrorHandler("user not found !", 404))

        const orderData = await order.findOne({_id : orderId})


        

        if(returnRefundData.status === "rejected" || returnRefundData.refundStatus === "closed" || returnRefundData.refundStatus === "refundedToWallet" || returnRefundData.refundStatus === "refundedByRazorpay"){
            returnRefundData.refundStatus = "closed"
            returnRefundData.status = "rejected"
            await returnRefundData.save()
            return next(new ErrorHandler("request already reslove !", 400))
        }

            return next(new ErrorHandler("order not found", 404))

        if(orderData.isRefunded){
            return next(new ErrorHandler("payment was already refunded", 400))
        }

        

        const amount = orderData.finalAmount + orderData.usedWalletAmount

        if(amount > 0){
            userData.walletBalance += amount
            userData = await userData.save()
            orderData.isRefunded = true
            await orderData.save()
        }

        returnRefundData.refundStatus = "refundedToWallet"
        returnRefundData.status = "approved"

        await returnRefundData.save()

        res.status(200).json({
            success : true,
            refundedAmount : amount,
            userData
        })

        
    
     }
    catch(err){
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
    
}



export const paymentRefund = async(req, res, next)=>{
    try {

        const {paymentId, requestId} = req.body

        
        
            return next(new ErrorHandler("please enter all the required filled", 400))

        const returnRefundData = await returnRefund.findOne({_id : requestId})

        const {orderId, userId} = returnRefundData
        
            return next(new ErrorHandler("no return data and refund found !", 404))
        const orderData = await order.findOne({_id : orderId})

            return next(new ErrorHandler("order not found !", 400))

            return next(new ErrorHandler("payment is alrady refunded !", 400))


        if(returnRefundData.status === "rejected" || returnRefundData.refundStatus === "closed" || returnRefundData.refundStatus === "refundedToWallet" || returnRefundData.refundStatus === "refundedByRazorpay"){
            returnRefundData.refundStatus = "closed"
            returnRefundData.status = "rejected"
            await returnRefundData.save()
            return next(new ErrorHandler("request already reslove !", 400))
        }

        const razorpayInstance = await RazorpayInstance()

        const amount = orderData.finalAmount

        const payment = await razorpayInstance.payments.fetch(paymentId);
        console.log(payment.status); 


        const razorpayRefund = await razorpayInstance.payments.refund(paymentId, {
            amount : amount ? amount * 100 : undefined,
            speed : "normal",
            notes : {
                reason : "customer reqest !"
            }
        })

        returnRefundData.refundStatus = "refundedByRazorpay"
        returnRefundData.status = "approved"

        await returnRefundData.save()

        res.status(200).json({success : true,
            razorpayRefund
        })

        

    
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err.message? err.message : err.error.description}`, 500))
    }
}

export const returnRequest = async (req, res, next)=>{
    try {
        const { orderId, returnReason } = req.body
        const userId = req.user._id

            return next(new ErrorHandler("please enter orderId", 400))

            return next(new ErrorHandler("orderId is not valid !", 400))

        const alreadyRequested = await returnRefund.findOne({orderId : orderId})

        if(alreadyRequested){
            return next(new ErrorHandler("already requested !", 400))
        }

        const data = await returnRefund.create({
            userId,
            orderId,
            returnReason
        })



        res.status(200).json({
            success : true,
            message : "request has send successfully !",
            data
        })

    
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const getAlltheRequests = async (req, res, next)=>{
try {
    const {status} = req.query
    const filter = {}
    if(status) filter.status = status
    const data = await returnRefund.find(filter)
  .sort({ createdAt: -1 });

    res.status(200).json({
        success : true,
        data
    })
    
} catch (err) {
    console.error(err)
    return next(new ErrorHandler(err.message, 500))
}
}



export const approveRequest = async (req, res, next)=>{
try {

    const {requestId} = req.body

        return next(new ErrorHandler("request not found !", 400))

    const alreadyapproved = await returnRefund.findOne({_id : requestId, status : "approved"})

    if(alreadyapproved){
        return next(new ErrorHandler("request was already approved !",400))
    }


    const data = await returnRefund.findOne({
        _id : requestId
    })

    data.status = "approved"

    await data.save()

    res.status(200).json({
        success : true,
        message : "request approved !",
        data
    })
 }   
 catch (err) {
    console.error(err)
    return next(new ErrorHandler(err.message, 500))
}
}


export const getOneRequest = async (req, res, next)=>{
try {
    const requestId = req.params.id

        return next(new ErrorHandler("requestId is required !", 400))

        return next(new ErrorHandler("requestId is not vaild !", 400))

    const data = await returnRefund.findOne({_id : requestId})


    res.status(200).json({
        success : true,
        data
    })
    
} catch (err) {
    console.error(err)
    return next(new ErrorHandler(err.message, 500))
}
}


export const rejectRequest = async (req, res, next)=>{
try {
    
    const {rejectReason, requestId} = req.body;
        return next(new ErrorHandler("requestId is required !", 400))

        return next(new ErrorHandler("requestId is not vaild !", 400))

    const data = await returnRefund.findOne({_id : requestId})

    data.rejectReason = rejectReason;
    data.status = "rejected"
    data.refundStatus = "closed"
    data.returnStatus = "closed"
    await data.save()


    res.status(200).json({
        success : true,
        data
    })
    
} catch (err) {
    console.error(err)
    return next(new ErrorHandler(err.message, 500))
}
}



export const updateRequest = async (req, res, next)=>{
try {
    const requestId = req.params.id

    const {status, returnStatus, returnDetails} = req.body

        return next(new ErrorHandler("requestId is required !", 400))

        return next(new ErrorHandler("requestId is not vaild !", 400))

    const data = await returnRefund.findOne({_id : requestId})

        return next(new ErrorHandler("request not found !", 400))

    if(data.status === "closed"){
        return next(new ErrorHandler("request was closed !", 400))
    }

    if(status) data.status = status;
    if(returnStatus) data.returnStatus = returnStatus
    if(returnDetails) data.returnDetails = returnDetails

    await data.save()

    res.status(200).json({
        success : true,
        data
    })
    
} catch (err) {
    console.error(err)
    return next(new ErrorHandler(err.message, 500))
}
}



