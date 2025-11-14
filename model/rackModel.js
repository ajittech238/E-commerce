import mongoose  from "mongoose";

const rackSchema = new mongoose.Schema({
    warehouseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "warehouse",
        required : true
    },
    rackNo : {
        type : String
    },
    rowNo : {
        type : String
    },
    maxCapacity : {
        type : Number
    },
    currentQuantity : {
        type : Number,
        default : 0
    },
}, {timestamps : true})


export const rack = mongoose.model("rack", rackSchema)