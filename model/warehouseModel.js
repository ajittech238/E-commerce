import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
    name : {
        type  : String,
        required : true
    },
    location : {
        type : Object
    },
    warehouseNo : {
        type : String,
        unique : true,
        required : true,
    },
    manager : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    }
}, {
    timestamps : true
})

export const warehouse = mongoose.model("warehouse", warehouseSchema)