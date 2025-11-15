import { salary } from "../model/salaryModel.js"
import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const addSalary = async(req, res, next)=>{
    try {
        
    const {user_Id ,employeeId, employeeName, amount, allowances, deductions } = req.body || {}


    

    const verfiy = await user.findOne({_id : user_Id})

    console.log(allowances)
    console.log(deductions)


    let totalSalary = amount + allowances - deductions


    if(verfiy.employeeId != employeeId){
        return next(new ErrorHandler("employee id doesn't match", 400))
    }

    const data = await new salary({
        user_Id : user_Id,
        employeeId : employeeId,
        employeeName,
        amount,
        allowances,
        deductions,
        totalSalary : totalSalary
    })

    await data.save()

    res.status(200).json({
        success : true,
        message : "salary has been added !"
    })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
    }
}

export const salaryHistory = async(req, res, next)=>{
    try {
        const eId = req.params.id

        const data = await salary.find({employeeId : eId}).populate("user_Id", 'userName email role').sort({createdAt : -1})

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


export const mySalaryHistory = async(req, res, next)=>{
    try {
        const user_Id = req.user._id

        const data = await salary.find({user_Id : user_Id})

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