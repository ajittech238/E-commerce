import mongoose from "mongoose"
import { rack } from "../model/rackModel.js"
import { rackProducts } from "../model/rackProductModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const addRackRoW = async (req, res, next) => {
    try {

        const { warehouseId, rackNo, rowNo, maxCapacity } = req.body


        if (!warehouseId || !rackNo || !rowNo || !maxCapacity) {
            return next(new ErrorHandler("All fields are required", 400));
        }
        const isRackNoAndRowNO = await rack.findOne({ warehouseId, rackNo, rowNo })

        if (isRackNoAndRowNO) {
            return next(new ErrorHandler("rackNo and rowNo already exists !", 400))
        }

        const rackData = await rack.create({
            warehouseId,
            rackNo,
            rowNo,
            maxCapacity
        })

        res.status(200).json({
            success: true,
            rackData
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const getRack = async (req, res, next) => {
    try {

        const { rackNo, rowNo } = req.query

        const filter = {}

        if (rackNo) filter.rackNo = rackNo
        if (rowNo) filter.rowNo = rowNo

        const rackData = await rack.find(filter)

        res.status(200).json({
            success: true,
            rackData
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const updateRackRoW = async (req, res, next) => {
    try {

        const { rackNo, rowNo, maxCapacity, currentQuantity } = req.body

        const rackId = req.params.id

          if (!mongoose.Types.ObjectId.isValid(rackId)) {
            return next(new ErrorHandler("Invalid rackId format!", 400));
        }

        if (!rackNo && !rowNo && !maxCapacity && !currentQuantity) {
            return next(new ErrorHandler("Please fill at least one field!", 400));
        }

        const rackData = await rack.findOne({ _id: rackId })

        if (!rackData) {
            return next(new ErrorHandler("Rack not found!", 404));
        }
        if (rackNo) rackData.rackNo = rackNo
        if (rowNo) rackData.rowNo = rowNo
        if (maxCapacity) rackData.maxCapacity = maxCapacity
        if (currentQuantity) rackData.currentQuantity = currentQuantity


        await rackData.save()

        res.status(200).json({
            success: true,
            rackData
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

export const deleteRack = async (req, res, next) => {
    try {

        const rackId = req.params.id
         if (!mongoose.Types.ObjectId.isValid(rackId)) {
            return next(new ErrorHandler("Invalid rackId format!", 400));
        }

        const rackData = await rack.findByIdAndDelete(rackId)


        if (!rackData) {
            return next(new ErrorHandler("Rack not found!", 404));
        }

        res.status(200).json({
            success: true,
            message: "rack delete successfully !"
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


// rack product management


export const addProductToRack = async (req, res, next) => {
    try {

        const { rackId, warehouseProductId, quantity } = req.body

         if (!rackId || !warehouseProductId || !quantity) {
            return next(new ErrorHandler("All fields are required", 400));
        }
        const isalreadyadded = await rackProducts.findOne({ rackId, warehouseProductId })

        if (isalreadyadded) {
            return next(new ErrorHandler("product is already added to this rack , you should update if you want to add quantity !", 400))
        }

        const rackData = await rackProducts.create({
            rackId,
            warehouseProductId,
            quantity
        })

        res.status(200).json({
            success: true,
            message: "product added to rack!",
            rackData
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const updateProductToRack = async (req, res, next) => {
    try {

        const rackId = req.params.id
        const { warehouseProductId, quantity } = req.body

         if (!mongoose.Types.ObjectId.isValid(rackId)) {
            return next(new ErrorHandler("Invalid rackId format!", 400));
        }


        const rackData = await rackProducts.findOne({ rackId, warehouseProductId })


        if (!rackData) {
            return next(new ErrorHandler("Product not found in this rack!", 404));
        }
        rackData.quantity = quantity

        await rackData.save()

        res.status(200).json({
            success: true,
            message: "product updated to rack!",
            rackData
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const getProductToRack = async (req, res, next) => {
    try {

        const rackId = req.params.id

          if (!mongoose.Types.ObjectId.isValid(rackId)) {
            return next(new ErrorHandler("Invalid rackId format!", 400));
        }

        const rackData = await rackProducts.find({ rackId })



        res.status(200).json({
            success: true,
            results: rackData.length,
            message: rackData.length === 0 ? "rack have no products" : undefined,
            rackData
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const DeleteProductToRack = async (req, res, next) => {
    try {

        const { rackId, warehouseProductId } = req.params
          if (!mongoose.Types.ObjectId.isValid(rackId)) {
            return next(new ErrorHandler("Invalid rackId format!", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(warehouseProductId)) {
            return next(new ErrorHandler("Invalid warehouseProductId format!", 400));
        }


        const rackData = await rackProducts.findOne({ rackId, warehouseProductId })


        if (!rackData) {
            return next(new ErrorHandler("Rack Product not found!", 404));
        }
        await rackData.deleteOne()

        res.status(200).json({
            success: true,
            message: "rackProduct delete successfully !"
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

