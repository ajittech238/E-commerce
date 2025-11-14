import mongoose from "mongoose";

const sellerInverntorySchema = new mongoose.Schema({
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "productDetails",
        required : true
    },
    quantity : {
        type : Number
    },
    purchasePrice : {
        type : Number
    }
}, {
    timestamps : true
})

export const sellerInverntory = mongoose.model("sellerInventory", sellerInverntorySchema)