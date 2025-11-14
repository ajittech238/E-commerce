import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    eventName : {
        type : String,
        required : true
    },
    eventType : {
        type : String,
        enum : ['flash', 'festival', 'clearance', 'special'],
        default : 'special'
    },
    description : {
        type : String,
        required : true
    },
    startDate : {
        type : Date,
        default : Date.now
    },
    endDate : {
        type : Date,
        default : Date.now,
        validate : {
            validator : function(value){
                return value >= this.startDate;
            },
            message : "endDate must be after startDate"
        }
    },
    discount : {
        type : Number,
        default : 0
    },
    maxDiscountAmount : {
        type : Number,
        default : 0
    },
    minPurchaseAmount : {
        type : Number,
        default : 0
    },
    iseventActive : {
        type : Boolean,
        default : false
    },

    categories : [
        {
            Category : {
                type : mongoose.Schema.Types.ObjectId,
            ref : "category"
            },
        
    }],
    bannerUrl : [{
        type : String,
        default : ""
    }],
    priority : {
        type : Number,
        default : 0
    }

}, {timestamps : true})


eventSchema.pre("save", function(next){
    const now = new Date();
    this.iseventActive = now >= this.startDate && now <= this.endDate;
    next()
})

export const event = mongoose.model("event", eventSchema)