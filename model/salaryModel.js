import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    user_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    employeeId : {
        type : String,
        required : true
    },
    employeeName : {
        type : String,
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    allowances : {
        type : Number,
        default : 0
    },
    deductions : {
        type : Number,
        default : 0
    },
    totalSalary : {
        type : Number
    }

},{timestamps : true})

export const salary = mongoose.model("salary", salarySchema)