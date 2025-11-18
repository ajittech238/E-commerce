import mongoose from "mongoose"
import { reward } from "../model/rewardModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const createReward = async (req, res, next) => {
    try {

        const {
            type,
            value,
            probability,
            isActive,
            expiresAt
        } = req.body || {}



        const data = await reward.create({
            //"coins", "cashback", "voucher", "free_delivery", "none"
            type,
            value,
            probability,
            isActive,
            expiresAt
        })

        res.status(200).json({
            success: true,
            data
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
    }
}


export const getRewardList = async (req, res, next) => {
    try {

        const data = await reward.find({})


        res.status(200).json({
            success: true,
            data
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
    }
}


export const editReward = async (req, res, next) => {
    try {

        const {
            type,
            value,
            probability,
            isActive,
            expiresAt
        } = req.body || {}

        const rewardId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(rewardId)) {
            return next(new ErrorHandler("Invalid reward ID", 400));
        }

        const data = await reward.findOne({ _id: rewardId })

        if (!data) {
            return next(new ErrorHandler("Reward not found", 404));
        }
        if (type) data.type = type
        if (value) data.value = value
        if (probability) data.probability = probability
        if (typeof isActive === "boolean") data.isActive = isActive
        if (expiresAt) data.expiresAt = expiresAt



        await data.save()

        res.status(200).json({
            success: true,
            data
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
    }
}



export const deleteReward = async (req, res, next) => {
    try {
        const rewardId = req.params.id
          if (!mongoose.Types.ObjectId.isValid(rewardId)) {
            return next(new ErrorHandler("Invalid reward ID", 400));
        }

        const data = await reward.findOne({ _id: rewardId })


        if (!data) {
            return next(new ErrorHandler("Reward not found", 404));
        }
        await data.deleteOne()

        res.status(200).json({
            success: true,
            message: "reward deleted successfully !"
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
    }
}


export const randomreward = async (req, res, next) => {
    try {
        const data = await reward.find({ isActive: true })

        const total = data.reduce((sum, r) => sum + r.probability, 0)

           console.log(total)

        let random = Math.random() * total;

        let selectreward = null;

        for (const reward of data) {
            if (random < reward.probability) {
                selectreward = reward
                break;
            }
            random -= reward.probability
        }

        // return null

       return res.status(200).json({
            success: true,
            reward: selectreward
        });

    } catch (err) {
        console.error(err)
    }
}
