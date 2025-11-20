import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from "dotenv";

config()


const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: false,
        select: false
    },
    role: {
        type: String,
        enum: ["user", "buyer", "seller", "employee", "admin"],
        default: 'buyer'
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },

    phoneNumber: {
        type: String,
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipcode: String
    },
    isbanned: {
        type: Boolean,
        default: false
    },
    isdisable: {
        type: Boolean,
        default: false
    },

    dateOfBirth: {
        type: Date
    },

    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },

    maritalStatus: {
        type: String,
        enum: ["Single", "Married"]
    },

    employeeId: {
        type: String
    },

    nationality: {
        type: String
    },
    emergencyContactName: {
        type: String
    },
    emergencyContactNumber: {
        type: String
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
         ref:'department'
    },
    designation: {
        type: String
    },
    dateOfJoined: {
        type: Date
    },
    contractType: {
        type: String
    },
    salary: {
        type: Number
    },
    bankAccount: {
        type: new mongoose.Schema({
            accountHolderName: {
                type: String
            },
            accountNumber: {
                type: String
            },
            ifcCode: {
                type: String
            },
            bankName: {
                type: String
            },
            branchName: {
                type: String
            },
        }),

        select: false
    },
    taxId: {
        type: String
    },
    // photo
    // resume

    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    walletBalance: {
        type: Number,
        default: 0
    },
    isWalletApplied: {
        type: Boolean,
        default: false
    },
    referlink: {
        type: String,
    },
    isRefered: {
        type: Boolean,
        default: false
    },
    referedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    // cashbacks : [
    //     {
    //         cashback : {
    //             type : Number,
    //         },
    //         byShop : {
    //             type : mongoose.Schema.Types.ObjectId
    //         },
    //         cashbackDate : {
    //             type : Date,
    //             default : Date.now
    //         }
    //     }
    // ]

}, { timestamps: true }
)

userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this.id, email: this.email }, process.env.JWT_SECRET)
}


userSchema.methods.generateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordTokenExpire = Date.now() + 1000 * 60 * 15
    return resetToken
}

userSchema.pre('save', function (next) {
    if (!this.referlink) {
        const data = new Date();
        const dateString = data.toLocaleString().replaceAll("/", "")
            .replaceAll(",", "")
            .replaceAll(" ", "")
            .replaceAll(":", "")
            .slice(0, 13);
        const userString = this._id.toString().slice(0, 9)
        this.referlink = dateString + userString
    }
    next();
})

export const user = mongoose.model("user", userSchema)



