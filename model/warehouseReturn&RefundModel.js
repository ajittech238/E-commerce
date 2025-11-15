import mongoose from "mongoose";

const warehouseReturnandRefundSchema = new mongoose.Schema({
        sellerId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user",
            required : true
        },
        warehouseOrderId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "warehouseOrders",
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


export const warehouseReturnandRefund = mongoose.model('warehouseReturnAndRefund', warehouseReturnandRefundSchema)