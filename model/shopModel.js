import mongoose from 'mongoose'

const shopSchema = new mongoose.Schema({
    shopName : {
        type : String,
        required : true
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    location : {
        address : {type : String, required : true},
        city : {type : String, required : true},
        state : {type : String, required : true},
        country : {type : String, required : true},
        passcode : {type : String, required : true}
    },
    contactNumber : {
        type : String,
        required : true
    },
    isShopVerified : {
        type : Boolean,
        default : false
    }

    
}, {timestamps : true})


export const shop = mongoose.model("shop", shopSchema)