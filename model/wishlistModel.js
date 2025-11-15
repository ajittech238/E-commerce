import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
        unique : true
    },
    items : [
       {
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "productDetails",
        },
       },
    ],
}, {timestamps : true})


export const wishlist = mongoose.model("wishlist", wishlistSchema)