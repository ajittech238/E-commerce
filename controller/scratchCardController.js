import { reward } from "../model/rewardModel.js";
import { scratchCard } from "../model/scratchModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";

export const randomreward = async()=>{
     try {
       const data = await reward.find({isActive : true})

       const total = data.reduce((sum, r)=> sum + r.probability, 0)

       let random = Math.random() * total;

       let selectreward ;

       for(const reward of data){
        if(random < reward.probability){
            selectreward = reward
            break;
        }
        random -= reward.probability
       }

        return null

       return selectreward

    //    return selectreward 

    } catch (err) {
        console.error(err)
    }
}



export const assignreward = async(userId, orderId)=>{
     try {
        const reward = await randomreward()
        const scratch = await scratchCard.create({
            userId,
            orderId,
            reward : {
                type : reward.type,
                value : reward.value
            }
        })
       
        return scratch
 
    } catch (err) {
        console.error(err)
    }
}


export const myScratch = async (req, res, next)=>{
    try {
        const userId = req.user._id
        const data = await scratchCard.find({userId : userId}).sort({createdAt : -1})
            return next(new ErrorHandler("there is no scratch card !", 200))
        res.status(200).json({
            success : true,
            results : data.length,
            data
        })
    } catch (err) {
        console.error(err)
    }
}


export const Scratchreward = async (req, res, next)=>{
    try {
        const userId = req.user._id
        const rewardId = req.params.id
        console.log(rewardId)
        const data = await scratchCard.findOne({
            _id : rewardId,
            userId : userId
        })
       
            return next(new ErrorHandler("scratch card not found !", 404))

        if(data.isScratched){
            return next(new ErrorHandler("scratch card alreay scratched !", 400))
        }

        data.isScratched = true

        await data.save()

        if(data.reward.type === "coins"){
            console.log("coin hai")
        }
        else{
            console.log(data.reward.value)
        }
        res.status(200).json({
            success : true,
            data
        })
    } catch (err) {
        console.error(err)
    }
}