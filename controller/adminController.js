import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const getAllUsers = async (req, res, next) => {
    try {
        const data = await user.find({})
        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        console.err(err)
        return next(new ErrorHandler("something went wrong !", 400))
    }

}

export const banuser = async (req, res, next) => {
    try {
        const userId = req.params.id
        console.log(userId)
        let data = await user.findById(userId)

        if (!data) {
            return next(new ErrorHandler("please enter valid user id", 400))
        }

        data.isbanned = !data.isbanned
        console.log(data.isbanned)

        await data.save({ validateBeforeSave: false })
        res.status(200).json({
            success: true,
            message: `user ${data.isbanned ? 'banned' : "unbanned"} successfully !`,
            data
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("internal sever error !", 500))
    }
}


export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id
        let data = await user.findById(userId)

        if (!data) return next(new ErrorHandler("please enter valid user id", 400))

        if (data) {
            await data.deleteOne({ _id: userId })
        }


        res.status(200).json({
            success: true,
            message: "user deleted successfully !",
            data
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("something went wrong !", 500))
    }
}



export const roleChange = async (req, res, next) => {
    try {
        const userId = req.params.id
        const { role } = req.body
        if (!role) {
            return next(new ErrorHandler("Role is required!", 400));
        }

        let data = await user.findById(userId)

        if (!data) {
            return next(new ErrorHandler("Please enter a valid user ID", 400));
        }
        if (data.isbanned) {
            return next(new ErrorHandler("user is banned !", 403))
        }

        data.role = role

        await data.save()

        res.status(200).json({
            success: true,
            message: `user update role is ${data.role} !`,
            data
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}


