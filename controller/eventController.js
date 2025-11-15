import mongoose from "mongoose"
import { event } from "../model/eventModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"
import { productDetails } from "../model/productModel.js"



export const getEvents = async (req, res, next) => {
    try {
        const data = await event.find({}).sort({ iseventActive: -1 })

        res.status(200).json({
            success: true,
            results: data.length,
            data
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}

export const createEvent = async (req, res, next) => {
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

        // if (!eventName || !description || !startDate || !endDate ||
        //     !maxDiscountAmount || !minPurchaseAmount || !categories) {
        //     return next(new ErrorHandler("All fields are required!", 400));
        // }

        if (!eventName ||
            !description ||
            !startDate ||
            !endDate ||
            !maxDiscountAmount ||
            !minPurchaseAmount ||
            !categories) {
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
            success: true,
            message: `event ${eventName} created !`,
            data
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}


export const updateEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;

        if (!Object.keys(req.body).length) {
            return next(new ErrorHandler("Please provide at least one field!", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return next(new ErrorHandler("Invalid event ID!", 400));
        }

        const data = await event.findById(eventId);

        if (!data) {
            return next(new ErrorHandler("Event not found!", 404));
        }

        const allowedFields = [
            "eventName",
            "eventType",
            "description",
            "startDate",
            "endDate",
            "discount",
            "maxDiscountAmount",
            "minPurchaseAmount",
            "products",
            "categories",
            "bannerUrl",
            "priority",
            "iseventActive"
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                data[field] = req.body[field];
            }
        });

        await data.save();

        res.status(200).json({
            success: true,
            message: `Event ${data.eventName} updated successfully!`,
            data
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler(err.message || "Update failed", 500));
    }
};




export const stopAllevent = async (req, res, next) => {
    try {
        const data = await event.updateMany({}, { iseventActive: false })

        if (!data.modifiedCount) {
            return next(new ErrorHandler("No active events found!", 200));
        }
        await productDetails.updateMany({}, [
            {
                $set: {
                    currentDiscount: "$discount"
                }
            }
        ]
        )
        res.status(200).json({
            success: true,
            message: `all event are stopped !`,
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err.message}`, 500))
    }
}

export const activeEvent = async (req, res, next) => {
    try {

        const eventId = req.params.id
        const data = await event.findOne({ _id: eventId })

        if (!eventId) {
            return next(new ErrorHandler("Event ID required!", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return next(new ErrorHandler("Invalid event ID!", 400));
        }
        if (!data) {
            return next(new ErrorHandler("Event not found!", 404));
        }
        await data.updateOne({ iseventActive: true })

        const newdata = await event.findOne({ iseventActive: true })


        if (!newdata) {
            return next(new ErrorHandler("No active event found!", 400));
        }

        console.log(newdata.discount)

        await productDetails.updateMany({},
            {
                $set: { currentDiscount: newdata.discount }
            }
        )


        res.status(200).json({
            success: true,
            message: `event is active ${data.eventName} !`,
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err.message}`, 500))
    }
}


export const stopOneEvent = async (req, res, next) => {
    try {

        const eventId = req.params.id
        const data = await event.findOne({ _id: eventId })

        if (!eventId) {
            return next(new ErrorHandler("Event ID is required!", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return next(new ErrorHandler("Invalid event ID!", 400));
        }
        if (!data) {
            return next(new ErrorHandler("Event not found!", 404));
        }
        await data.updateOne({ iseventActive: false })

        await productDetails.updateMany({}, [
            {

                $set: {
                    currentDiscount: "$discount"
                }
            }
        ]
        )

        res.status(200).json({
            success: true,
            message: `event ${data.eventName} is deactive  !`,
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err.message}`, 500))
    }
}
// get active events 

export const getActiveEvent = async (req, res, next) => {
    try {
        const activeEvent = await event.find
        
        ({ iseventActive: true });

        if (!activeEvent) {
            return res.status(200).json({
                success: true,
                message: "No event is active right now!",
                activeEvent: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Active event fetched successfully",
            activeEvent
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler(`${err.message}`, 500));
    }
};
