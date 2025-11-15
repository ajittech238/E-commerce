import mongoose from "mongoose"
import { department } from "../model/departmentModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const getDepartment = async (req, res, next) => {
    try {
        const data = await department.find({})
        if (data.length === 0) {
            return next(new ErrorHandler("no department found", 200))
        }

        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        return next(new ErrorHandler("error getting department !", 500))
    }
}

export const addDepartment = async (req, res, next) => {
    try {
        const { departmentName } = req.body
        let data = await department.findOne({ departmentName })
        if (data) {
            return next(new ErrorHandler("this department already exits", 400))
        }

        data = await new department({
            departmentName
        })

        await data.save()

        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        return next(new ErrorHandler("error getting department !", 500))
    }
}


export const updateDepartment = async (req, res, next) => {
    try {
        const { departmentName } = req.body
        const departmentId = req.params.id
        const data = await department.findOne({ _id: departmentId })
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return next(new ErrorHandler("Invalid department ID!", 400));
        }
        if (!data) {
            return next(new ErrorHandler("Department not found!", 404));
        }
        data.departmentName = departmentName

        await data.save()

        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        return next(new ErrorHandler("error getting department !", 500))
    }
}


export const deleteDepartment = async (req, res, next) => {
    try {
        const departmentId = req.params.id
        const data = await department.findOneAndDelete({ _id: departmentId })
        if (!data) {
            return next(new ErrorHandler("Department not found!", 404));
        }
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return next(new ErrorHandler("Invalid department ID!", 400));
        }
        


        res.status(200).json({
            success: true,
            message: "department deleted successfully !"
        })
    } catch (err) {
        return next(new ErrorHandler("error getting department !", 500))
    }
}