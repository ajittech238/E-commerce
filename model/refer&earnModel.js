import mongoose from "mongoose";

const referSchema = new mongoose.Schema({
    referUserId :  {
    type : mongoose.Schema.Types.ObjectId,
    ref : "user",
    required : true },

    userInvited : [
        {
            userId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "user",
                required : true
            },
            invitedAt : {
                type : Date,
                default : Date.now
            }
        }
    ],

    inviteCount : {
        type : Number,
        default : 0,
    },

    totalearning : {
        type : Number,
        default : 0
    }

})

export const refer = mongoose.model('refer', referSchema)