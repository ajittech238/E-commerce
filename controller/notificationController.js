import { notification } from "../model/notificationModel.js"
import { user } from "../model/userModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js"

export const getAllnotification = async(req, res, next)=>{
    try{
        const userId = req.user._id
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const data = await notification
        .find({user : userId})
        .sort({createdAt : -1})
        .skip(skip)
        .limit(limit)

        if(data.length === 0){
            return next(new ErrorHandler("no notification", 200))
        }

        res.status(200).json({
            success : true,
            count : data.length,
            data
        })
    }
    catch(err){
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}

export const sendNotificationToAll = async(req, res, next)=>{

    try{
        const {title, message, link , type } = req.body

        
        const data = await user.find({})

        if(data.length === 0){
            return next(new ErrorHandler("no user found !", 404))
        }

        const notify = data.map((mydata)=>({
            user : mydata._id,
            title : title,
            message : message,
            link : link || null,
            type : type
        }))

        await notification.insertMany(notify)

        res.status(201).json({
            success : true,
            message : "notification sended to all users"
        })
    }
    catch(err){
        console.error(err)
        return next(new ErrorHandler("failed to send notification !", 500))
    }

}


export const deleteNotification = async(req, res, next)=>{
    try{
        const userId = req.user._id
        const notificationId = req.params.id

        const data = await notification
        .findOneAndDelete({_id : notificationId,
            user : userId})
 

            return next(new ErrorHandler("notification already deleted", 404))

        res.status(200).json({
            success : true,
            message : "notification deleted successfully !"
        })
    }
    catch(err){
        console.log(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}



export const clearNotifications = async(req, res, next)=>{
    try{
        const userId = req.user._id

        const data = await notification
        .deleteMany({user : userId})
 

        if(data.deletedCount === 0){
            return next(new ErrorHandler("all notification are already cleared ", 404))
        }

        res.status(200).json({
            success : true,
            message : "all notification are cleared successfully !"
        })
    }
    catch(err){
        console.log(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}

export const getOneNotification = async(req, res, next)=>{
    try{
        const userId = req.user._id
        const notificationId = req.params.id

        const data = await notification.findOne({_id: notificationId, user: userId})

            return next(new ErrorHandler("Notification not found", 404))

        res.status(200).json({
            success: true,
            notification: data
        })
    }
    catch(err){
        return next(new ErrorHandler("Error getting notification", 500))
    }
}

export const updateNotification = async(req, res, next)=>{
    try{
        const userId = req.user._id
        const notificationId = req.params.id
        const {isRead} = req.body

        const data = await notification.findOneAndUpdate(
            {_id: notificationId, user: userId},
            {isRead},
            {new: true}
        )

            return next(new ErrorHandler("Notification not found", 404))

        res.status(200).json({
            success: true,
            message: "Notification updated successfully",
            notification: data
        })
    }
    catch(err){
        return next(new ErrorHandler("Error updating notification", 500))
    }
}
