import mongoose from "mongoose";


const warehouseOrderSchema = new mongoose.Schema({
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },

    warehouseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "warehouse",
        required : true
    },

    items : [
        {
            warehouseProduct : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "warehouseProduct"
            },
            quantity : {
                type : Number
            },
            unitPrice : {
                type : Number
            }

        }
    ],

    totalAmount : {
        type : Number
    },

    paymentStatus : {
        type : String,
        enum : ["pending", "paid"]
    },

    status : {
        type : String,
        enum : ["pending","processing", "approved", "delivered"],
        default : "pending"
    },
    shippingAddress : {
        type : Object
    },
    razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  }

    

}, {timestamps : true})


export const warehouseOrder = mongoose.model("warehouseOrder", warehouseOrderSchema)

