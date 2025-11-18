import mongoose from "mongoose";
import { notification } from "../model/notificationModel.js"
import { user } from "../model/userModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js"

export const getAllnotification = async (req, res, next) => {
    try {
        const userId = req.user._id
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const data = await notification
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        if (data.length === 0) {
            return next(new ErrorHandler("no notification", 200))
        }

        res.status(200).json({
            success: true,
            count: data.length,
            data
        })
    }
    catch (err) {
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}

export const sendNotificationToAll = async (req, res, next) => {

    try {
        const { title, message, link, type } = req.body


        const data = await user.find({})

        if (data.length === 0) {
            return next(new ErrorHandler("no user found !", 404))
        }

        const notify = data.map((mydata) => ({
            user: mydata._id,
            title: title,
            message: message,
            link: link || null,
            type: type
        }))

        await notification.insertMany(notify)

        res.status(201).json({
            success: true,
            message: "notification sended to all users"
        })
    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to send notification !", 500))
    }

}


export const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user._id
        const notificationId = req.params.id

        const data = await notification
            .findOneAndDelete({
                _id: notificationId,
                user: userId
            })



        if (!data) {
            return next(new ErrorHandler("Notification not found or already deleted", 404));
        }

        res.status(200).json({
            success: true,
            message: "notification deleted successfully !"
        })
    }
    catch (err) {
        console.log(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}



export const clearNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id

        const data = await notification
            .deleteMany({ user: userId })


        if (data.deletedCount === 0) {
            return next(new ErrorHandler("all notification are already cleared ", 404))
        }

        res.status(200).json({
            success: true,
            message: "all notification are cleared successfully !"
        })
    }
    catch (err) {
        console.log(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }

}

export const getOneNotification = async (req, res, next) => {
    try {
        const userId = req.user._id
        const notificationId = req.params.id

        const data = await notification.findOne({ _id: notificationId, user: userId })

        if (!data) {
            return next(new ErrorHandler("Notification not found", 404));
        }
        res.status(200).json({
            success: true,
            notification: data
        })
    }
    catch (err) {
        return next(new ErrorHandler("Error getting notification", 500))
    }
}




const ALLOWED_TYPES = ["order", "promo", "wishlist", "admin"];
const UPDATABLE_FIELDS = ["title", "message", "link", "type", "isRead"];

export const updateNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;
    const payload = req.body || {};

    // 1. Validate ID
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return next(new ErrorHandler("Invalid notification ID", 400));
    }

    // 2. Make sure something to update was provided
    if (!Object.keys(payload).length) {
      return next(new ErrorHandler("Please provide at least one field to update", 400));
    }

    // 3. Build update object only with allowed fields
    const update = {};
    UPDATABLE_FIELDS.forEach((f) => {
      if (Object.prototype.hasOwnProperty.call(payload, f)) {
        update[f] = payload[f];
      }
    });

    // 4. Type conversions / validations
    if (update.isRead !== undefined) {
      // Accept booleans or "true"/"false" strings or 0/1
      if (typeof update.isRead === "string") {
        const v = update.isRead.toLowerCase();
        if (v === "true" || v === "1") update.isRead = true;
        else if (v === "false" || v === "0") update.isRead = false;
        else return next(new ErrorHandler("isRead must be a boolean", 400));
      } else {
        update.isRead = Boolean(update.isRead);
      }
    }

    if (update.type !== undefined) {
      if (!ALLOWED_TYPES.includes(update.type)) {
        return next(new ErrorHandler(`Type must be one of: ${ALLOWED_TYPES.join(", ")}`, 400));
      }
    }

    // 5. If no permitted fields after filtering, return error
    if (Object.keys(update).length === 0) {
      return next(new ErrorHandler("No valid fields to update", 400));
    }

    // 6. Perform update — ensure user owns the notification
    const updated = await notification.findOneAndUpdate(
      { _id: notificationId, user: userId }, // ownership enforced
      { $set: update },
      { new: true }
    );

    if (!updated) {
      // Could be not found or not belonging to this user
      return next(new ErrorHandler("Notification not found or you don't have permission", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      notification: updated
    });
  } catch (err) {
    console.error("updateNotification error:", err);
    return next(new ErrorHandler("Error updating notification", 500));
  }
};
