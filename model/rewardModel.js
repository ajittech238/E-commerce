import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
    type : {
        type : String,
        enum : ["coins", "cashback", "voucher", "free_delivery", "none"],
        required : true
    },
    value : {
        type : mongoose.Schema.Types.Mixed,
        required : true
    },
    probability : {
        type : Number,
        default : 1
    },
    isActive : {
        type : Boolean,
        default : true
    },
    expiresAt : {
        type : Date,
    },
}, {timestamps : true})

export const reward = mongoose.model("reward", rewardSchema)