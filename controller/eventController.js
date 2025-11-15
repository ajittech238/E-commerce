import mongoose from "mongoose"
import { event } from "../model/eventModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"
import { productDetails } from "../model/productModel.js"



export const getEvents = async (req, res , next)=>{
    try {
    const data = await event.find({}).sort({iseventActive : -1})

    res.status(200).json({
        success : true,
        results : data.length,
        data
    })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}

export const createEvent = async (req, res , next)=>{
    try {
        const { 
             eventName, 
                eventType,
                description, 
                startDate, 
                endDate, 
                discount, 
                maxDiscountAmount, 
                minPurchaseAmount, 
                categories,
                bannerUrl,  
                priority 
         } = req.body || {}

        return next(new ErrorHandler("required req.body", 400))

    if( !eventName || 
        !description || 
        !startDate || 
        !endDate || 
        !maxDiscountAmount|| 
        !minPurchaseAmount|| 
        !categories ){
            return next(new ErrorHandler("please all the fields !", 400))
        }

        const data = await event.create({
                eventName, 
                eventType,
                description, 
                startDate, 
                endDate, 
                discount, 
                maxDiscountAmount, 
                minPurchaseAmount, 
                categories,
                bannerUrl,  
                priority 
        })

        await data.save()

    res.status(200).json({
        success : true,
        message : `event ${eventName} created !`,
        data
    })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}


export const updateEvent = async (req, res , next)=>{
    try {
        const eventId = req.params.id

            return next (new ErrorHandler("event Id is required !", 400))

            return next(new ErrorHandler("event Id is invalid !", 400))
        const { 
             eventName, 
                eventType,
                description, 
                startDate, 
                endDate, 
                discount, 
                maxDiscountAmount, 
                minPurchaseAmount, 
                products, 
                categories,
                bannerUrl,  
                priority,
                iseventActive
         } = req.body || {}

        return next(new ErrorHandler("required req.body", 400))

    if( !eventName && 
        !description && 
        !startDate && 
        !endDate && 
        !discount && 
        !maxDiscountAmount&& 
        !minPurchaseAmount&& 
        !products && 
        !categories ){
            return next(new ErrorHandler("please at least one field !", 400))
        }

        const data = await event.findOne({})
            if(eventName) data.eventName = eventName
            if(description) data.description = description
            if(eventType) data.eventType = eventType
            if(startDate) data.startDate = startDate
            if(endDate) data.endDate = endDate
            if(maxDiscountAmount) data.maxDiscountAmount = maxDiscountAmount
            if(minPurchaseAmount) data.minPurchaseAmount = minPurchaseAmount
            if(products) data.products = products
            if(categories) data.categories = categories
            if(bannerUrl) data.bannerUrl = bannerUrl
            if(priority) data.priority = priority
            if(iseventActive) data.iseventActive = iseventActive
                
                
        

        await data.save()

    res.status(200).json({
        success : true,
        message : `event ${data.eventName} updated !`,
        data
    })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
    }
}



export const stopAllevent = async (req, res , next)=>{
    try {
    const data = await event.updateMany({}, {iseventActive : false})
        return next(new ErrorHandler("no event is active", 200))
    await productDetails.updateMany({}, [
        {
            $set : {
                currentDiscount : "$discount"
            }
        }
    ]
    )
    res.status(200).json({
        success : true,
        message : `all event are stopped !`,
    })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err.message}`, 500))
    }
}

export const activeEvent = async (req, res , next)=>{
    try {

    const eventId = req.params.id
    const data = await event.findOne({_id : eventId})

        return next(new ErrorHandler("req.params required !", 400))

        return next(new ErrorHandler("event id is not valid", 400))

        return next(new ErrorHandler("event not found !", 404))

    await data.updateOne({iseventActive : true})

    const newdata = await event.findOne({iseventActive : true})


        return next(new ErrorHandler("no events !", 400))

    console.log(newdata.discount)

    await productDetails.updateMany({}, 
        {
        $set : {currentDiscount : newdata.discount}
     }
    )


    res.status(200).json({
        success : true,
        message : `event is active ${data.eventName} !`,
    })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err.message}`, 500))
    }
}


export const stopOneEvent = async (req, res , next)=>{
    try {

    const eventId = req.params.id
    const data = await event.findOne({_id : eventId})

        return next(new ErrorHandler("event id is required !", 400))

        return next(new ErrorHandler("event id is invalid", 400))

        return next(new ErrorHandler("evnet not found !", 404))

    await data.updateOne({iseventActive : false})

    await productDetails.updateMany({}, [
        {
        
            $set : {
                currentDiscount : "$discount"
            }
        }
    ]
    )

    res.status(200).json({
        success : true,
        message : `event ${data.eventName} is deactive  !`,
    })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err.message}`, 500))
    }
}