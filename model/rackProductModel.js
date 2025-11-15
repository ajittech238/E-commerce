import mongoose from "mongoose";

const rackProudctSchema = new mongoose.Schema({
    rackId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
    
    warehouseProductId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "warehouseProudct"
     },
    quantity : {
        type : Number,
        default : 0
    },
  
}, {timestamps : true})


export const rackProducts = mongoose.model("rackProducts", rackProudctSchema)