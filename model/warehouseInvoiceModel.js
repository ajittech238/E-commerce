import mongoose from "mongoose";


const warehouseInvoiceSchema = new mongoose.Schema({
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
    warehouseOrderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "warehouseOrder",
        required : true
    },

    items : [{
        productName : {
            type : String
        },
        sku : {
            type : String
        },
        quantity : {
            type : Number
        },
        price : {
            type : Number
        }
    },
    ], 
    shippingAddress : {
        type : Object
    },

    totalAmount : {
        type : Number,
        required : true
    }


}, {timestamps : true})

export const warehouseInvoice = mongoose.model('warehouseInvoice', warehouseInvoiceSchema)