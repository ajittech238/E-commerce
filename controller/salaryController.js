import mongoose from "mongoose"
import { salary } from "../model/salaryModel.js"

import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"
export const addSalary = async (req, res, next) => {
  try {
    const {
      user_Id,
      employeeId,
      employeeName,
      amount,
      allowances = 0,
      deductions = 0
    } = req.body;

  
    if (!user_Id || !employeeId || !employeeName || amount == null) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    const verify = await user.findById(user_Id);
    if (!verify) return next(new ErrorHandler("User not found", 404));

 
    console.log("DB employeeId:", verify.employeeId);
    console.log("Payload employeeId:", employeeId);

 
    if (verify.employeeId !== employeeId) {
      return next(
        new ErrorHandler("Employee ID doesn't match with user's record", 400)
      );
    }

    const totalSalary =
      Number(amount) + Number(allowances) - Number(deductions);

   
    const data = new salary({
      user_Id,
      employeeId,
      employeeName,
      amount,
      allowances,
      deductions,
      totalSalary
    });

    await data.save();

    return res.status(200).json({
      success: true,
      message: "Salary added successfully",
      salary: data
    });

  } catch (err) {
    console.error(err);
    return next(new ErrorHandler(err.message || "Server error", 500));
  }
};


export const salaryHistory = async(req, res, next)=>{
    try {
        const eId = req.params.id

        console.log(eId)
        const data = await salary.find({employeeId : eId}).populate("user_Id", 'userName email role').sort({createdAt : -1})

        console.log(data)

        if(data.length === 0){
            return next(new ErrorHandler("invalid id", 400))
        }

        res.status(200).json({
            success : true,
            results : data.length,
            salaryHistory : data
        })
    } catch(err) {
        console.error(err)
        return next(new ErrorHandler("something went wrong", 500))
    }
}


export const mySalaryHistory = async (req, res, next) => {
  try {
    // Check if user available from auth
    if (!req.user || !req.user._id) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    const user_Id = req.user._id;
    console.log("Logged-in User ID:", user_Id);

    // Find salary records
    const data = await salary.find({ user_Id: user_Id });

    console.log("Salary history found:", data);

    if (!data || data.length === 0) {
      return next(new ErrorHandler("No salary history found for this user", 404));
    }

    res.status(200).json({
      success: true,
      results: data.length,
      salaryHistory: data
    });

  } catch (err) {
    console.error(err);
    return next(new ErrorHandler("Something went wrong", 500));
  }
};
