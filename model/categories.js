
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    type: {
    type: String,
    enum: ["main", "gift", "home", "fashion"],
    required: true
  }

}, {timestamps : true})

export const Category = mongoose.model("category", categorySchema)