import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    departmentName : {
        type : String,
        required : true,
        unique : true,
        trim : true
    }
}, {timestamps : true})

export const department = mongoose.model('department', departmentSchema)