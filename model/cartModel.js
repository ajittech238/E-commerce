import mongoose, { Schema } from "mongoose";

const cartSchema = new mongoose.Schema({
    
    userId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    items : [
        {
            productId : {
                type : Schema.Types.ObjectId,
                ref : "productDetails"
            },
            quantity : {
                type : Number,
                default : 1
            }
        }
    ],
    couponDiscount : {
        type : Number,
        default : 0
    }
   
   
})

export const Cart = mongoose.model("Cart", cartSchema)