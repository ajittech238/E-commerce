import mongoose from "mongoose"
import { department } from "../model/departmentModel.js"
import { leave } from "../model/leaveModel.js"
import { salary } from "../model/salaryModel.js"
import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const applyingLeave = async(req, res, next)=>{
    try {
        const userId = req.user._id
        const { 
            leaveType,
            from,
            to,
            description } = req.body

              if (!leaveType || !from || !to) {
      return next(new ErrorHandler("leaveType, from and to are required", 400));
    }


        const data = await new leave({
            user : userId,
            leaveType,
            from,
            to,
            description
        })

        await data.save()

        res.status(200).json({
            success : true,
            message: "Leave applied successfully",
            data
        })
              
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("something went wrong", 500))
    }
}


export const checkLeave = async(req, res, next)=>{
    try {
        const userId = req.user._id
        const { status } = req.query

        const filter = {user : userId}

        if(status){
            filter.status = status
        }
        
        const data = await leave.find(filter)
        if(!data){
            return next(new ErrorHandler("no leaves found !", 200))


        }

        res.status(200).json({
            success : true,
            results : data.length,
            data
        })
              
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("something went wrong", 500))
    }
}


export const checkLeaves = async(req, res, next)=>{
    try {

        const { status } = req.query

        const filter = {}

        if(status){
            filter.status = status
        }
      
        const data = await leave.find(filter)
        if(!data){
                        return next(new ErrorHandler("no leaves found !", 200))

        }

        res.status(200).json({
            success : true,
            results : data.length,
            data
        })
              
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("something went wrong", 500))
    }
}



export const approveLeaves = async(req, res, next)=>{
    try {
        
        const {leaveId, status} = req.body
          if (!leaveId || !status) {
      return next(new ErrorHandler("leaveId and status are required", 400));
    }
    
    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      return next(new ErrorHandler("Invalid leaveId", 400));
    }
        const AllowedStatus = ["pending", "approved", "rejected"]

 if (!AllowedStatus.includes(status)) {
      return next(new ErrorHandler(`Status must be one of: ${allowedStatus.join(", ")}`, 400));
    }
        const data = await leave.findOne({_id : leaveId})

 if (!data) {
      return next(new ErrorHandler("Leave not found", 404));
    }
        data.status = status
        data.save()
        res.status(200).json({
            success : true,
            data
        })
              
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("something went wrong", 500))
    }
}

export const dashboardOverview = async(req, res, next)=>{
    const { status } = req.query
    try {
        const total_employee = await user.find({role : "employee"})

    if (total_employee === 0) {
      return next(new ErrorHandler("No employees found", 404));
    }
        const total_department = await department.find({})

  if (total_department === 0) {
      return next(new ErrorHandler("No departments found", 404));
    }

        const total_salary = await salary.aggregate([{
            $group : {
                _id : null,
                totalsalary : {
                  $sum : "$amount"  
                }
            }
    }])

 let pending = 0, approved = 0, rejected = 0, total_leaves = 0;
    const total_leave = await leave.aggregate([
        {
            $group : {
                _id : "$status",
                count : { $sum : 1}
            }
        }
    ])
    total_leave.forEach((item)=>{
        if(item._id === "pending") pending = item.count
        if(item._id === "approved") approved = item.count
        if(item._id === "rejected") rejected = item.count
        total_leaves += item.count
    })

        res.status(200).json({
            success : true,
            total_employee : total_employee.length,
            total_department : total_department.length,
            total_salary : total_salary.length > 0 ? total_salary[0].totalsalary : 0,
            total_leave : total_leaves,
            pending_leave : pending,
            approved_leave : approved,
            rejected_leave : rejected,
        })

    } catch (err) {
        return next(new ErrorHandler("error fetching dashboard data", 500))
    }
}