import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    type : {
        type : String,
        enum : ['credit', 'debit'],
        required : true,
    },
    amount : {
        type : Number,
        required : true,
    }, 
    description : {
        type : String
    }
}, {timestamps : true})

export const transation = mongoose.model("transtion", transactionSchema)