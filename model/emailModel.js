import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
    sentBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    email : {
        type : String,
        // required : true
        trim : true,
        lowercase : true
    },
    emailList : [{
        type : String,
        trim : true,
        lowercase : true
    },],
    subject : {
        type : String,
        required : true
    },
    message : {
        type : String,
        required : true
    }
    

}, {timestamps : true})


export const emailDetails = mongoose.model("emailDetails", emailSchema)