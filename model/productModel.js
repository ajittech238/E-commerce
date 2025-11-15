import mongoose, { Schema } from "mongoose";
import { config } from "dotenv";
config()

export const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    shopName : {
        type : String,
        required : true
    },
    shopId : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    images : {
        type : Array,
        default : []
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "category"
    },
    quantity : {
        type : Number,
        required : true
    },
    itemTag : {
        type : String,
        required : true
    },
    shippingTag : {
        type : String,
        required : false
    },
    userId : {
        type : Schema.Types.ObjectId,
        ref : "user"
    },
    discount : {
        type : Number,
        default : 2
    },
    currentDiscount : {
        type : Number,
        default : function(){
            return this.discount
        }
    },
    
}, {timestamps : true})

export const productDetails = mongoose.model("productDetails", productSchema)