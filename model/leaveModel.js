import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    leaveType : {
        type : String,
        enum : ["Sick Leave", "Casual leave", "Other"],
        required : true
    },
    from : {
        type : Date,
        required : true
    },
    to : {
        type : Date,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    appliedDate : {
        type : Date,
        default : Date.now()
    },
    status : {
        type : String,
        enum : ["approved", "rejected", "pending"],
        default : "pending"
    }
})

export const leave = mongoose.model("leave", leaveSchema)