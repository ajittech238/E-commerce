import mongoose from "mongoose";


const returnRefundSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    orderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "order",
        required : true
    },
    status : {
        type : String,
        enum : ["pending","approved", "rejected"],
        default : "pending"
    },
    returnReason : {
        type : String,
        required : true
    },
    returnStatus : {
        type : String,
        enum : ["process", "progress", "returned", "closed"],
        default : "process"
    },
    refundStatus : {
        type : String,
        enum : ["pending", "refundedToWallet", "refundedByRazorpay", "closed"],
        default : "pending"
    },
    rejectReason : {
        type : String
    },
    refundDetails : {
        type : Object
    },
    returnDetails : {
        type : Object
    }
}, {timestamps : true})

export const returnRefund = mongoose.model("return&refund", returnRefundSchema)