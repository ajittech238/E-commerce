import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    couponTitle : {
        type : String,
        required : true
    },
    couponCode : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    couponExpiry : {
        type : Date,
        required : true
    },
    couponDiscount : {
        type : Number,
        default : 2
    },
    useLimit : {
        type : Number,
        default : null
    },
    useCount : {
        type : Number,
        default : 0
    },
    userBy : {
        type : mongoose.Schema.Types.ObjectId,
        "ref" : "user",
        required : true
    },
    usedBy : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }]
}, {timestamps : true})

export const coupon = mongoose.model("coupon", couponSchema)

