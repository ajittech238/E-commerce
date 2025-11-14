import mongoose from "mongoose";

const scratchCardSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    orderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "order", 
        required : true
    },
    reward : {
    
        type : {
        type : String,
        enum : ["coins", "cashback", "voucher", "free_delivery", "none"],
        required : true},
        value : {
            type : mongoose.Schema.Types.Mixed, 
            required : true
        },
    },
   isScratched : {
    type : Boolean,
    default : false
   }

},{timestamps : true})

export const scratchCard = mongoose.model("scratchCard", scratchCardSchema)