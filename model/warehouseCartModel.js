import mongoose from "mongoose";

const warehouseCartSchema = new mongoose.Schema({
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    items : [
        {
            warehouseProductId : {
                type : mongoose.Schema.Types.ObjectId,
                ref  : "warehouseProduct",
                required : true
            }, 
            quantity : {
                type : Number
            }
        }
    ]
})

export const warehouseCart = mongoose.model("warehouseCart", warehouseCartSchema)