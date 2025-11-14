import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({

    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "productDetails",
        required : true
    },

    review : [
        {
        rating : {
        type : Number,
        enum : [1, 2, 3, 4, 5]
    },
    byUser : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    comment : {
        type : String,
        required : true
    }
        },
    ]

 
})

export const review = mongoose.model("review", reviewSchema)