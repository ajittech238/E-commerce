import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const getConnectWhatsapp = async(req, res, next)=>{
    try{
        const { userId } = req.body

        const data = await user.findById({_id : userId})
        
        if(!data){
            return next(new ErrorHandler("User not found", 404))
        }

        const base_link = `https://api.whatsapp.com/send?phone=91${data.phoneNumber}`

        res.status(200).json({
            success : true,
            walink : base_link
        })
    } catch(error){
        next(error)
    }
}