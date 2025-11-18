import { refer } from "../model/refer&earnModel.js"
import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const myReferData = async (req, res, next) => {
    try {
        const userId = req.user._id;

        let data = await refer.findOne({ referUserId: userId })
            .populate("referUserId", "userName email referlink")
            .populate("userInvited.userId", "userName email");

        // If no record, create empty refer record
        if (!data) {
            data = await refer.create({
                referUserId: userId,
                userInvited: [],
                inviteCount: 0,
                totalearning: 0
            });
        }

        res.status(200).json({
            success: true,
            myreferalData: data
        });
    } catch (err) {
        console.error(err);
        return next(new ErrorHandler("Server error", 500));
    }
};



export const allReferData = async (req, res, next) => {
    try {
        const data = await refer.find({})
            .populate('referUserId', 'userName email role referlink')
            .populate('userInvited.userId', 'userName email')

        if (!data || data.length === 0) {
            return next(new ErrorHandler("No referral records found", 404));
        }

        res.status(200).json({
            success: true,
            referalData: data
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}


export const OneUserReferData = async (req, res, next) => {
    try {
        const userId = req.params.id

        const data = await refer.findOne({ referUserId: userId })
            .populate('referUserId', 'userName email role referlink')
            .populate('userInvited.userId', 'userName email')
        console.log(data)
        if (!data) {
            return next(new ErrorHandler("No referral record found for this user", 404));
        }
        res.status(200).json({
            success: true,
            userreferalData: data
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}



export const referDashboardData = async (req, res, next) => {
    try {

        const data = await refer.aggregate([
            {
                $group: {
                    _id: null,
                    referaluser: { $sum: 1 },
                    inviteCount: { $sum: '$inviteCount' },
                    totalearning: { $sum: '$totalearning' }
                }
            }
        ])

        if (!data || data.length === 0) {
            return next(new ErrorHandler("No dashboard records", 404));
        }
        res.status(200).json({
            success: true,
            userreferalData: data[0]
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}
