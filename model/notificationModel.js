import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    title : {
        type : String,
        required : true
    },
    message : {
        type : String,
        required : true
    },
    link : {
        type : String,
        default : null
    },
    type : {
        type : String,
        enum : ["order", "promo", "wishlist", "admin"],
        default : "order"
    },

}, {timestamps : true})

export const notification = mongoose.model("notification", notificationSchema)