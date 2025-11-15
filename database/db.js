import mongoose from "mongoose";

export const connectDB = ()=>{
    mongoose.connect(process.env.MONGO_DB_URI, {
        dbName : "ecommerce"
    })
    .then(()=>{
        console.log("database conneted successfully ! ")
    })
    .catch((err)=>{
        console.log("database connection failed...!")
    })
}