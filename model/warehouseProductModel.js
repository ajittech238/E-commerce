import mongoose from "mongoose";

const warehouseProductSchema = new mongoose.Schema({
    warehouseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "warehouse",
        required : true
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "productDetails",
        required : true
    },
    sku : { //stoke keeping unit
        type : String,
        required : true
    },
    quantity : {
        type : Number,
        default : 0
    },
    costPrice : {
        type : Number
    },
    expiryDate : {
        type : Date
    },
    batchNumber : {
        type : String 
    }
}, {
    timestamps : true
})

export const warehouseProduct = mongoose.model("warehouseProduct", warehouseProductSchema)