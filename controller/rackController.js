import mongoose from "mongoose"
import { rack } from "../model/rackModel.js"
import { rackProducts } from "../model/rackProductModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"
import { warehouse } from "../model/warehouseModel.js"
import { warehouseProduct } from "../model/warehouseProductModel.js"

export const addRackRoW = async (req, res, next) => {
    try {

        const { warehouseId, rackNo, rowNo, maxCapacity } = req.body


        if (!warehouseId || !rackNo || !rowNo || !maxCapacity) {
            return next(new ErrorHandler("All fields are required", 400));
        }

         const warehouseExist = await warehouse.findById(warehouseId);
        if (!warehouseExist) {
            return next(new ErrorHandler("Warehouse not found!", 404));
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
        const { rackId, warehouseProductId, quantity } = req.body;

        if (!rackId || !warehouseProductId || !quantity) {
            return next(new ErrorHandler("All fields are required", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(rackId)) {
            return next(new ErrorHandler("Invalid rackId format!", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(warehouseProductId)) {
            return next(new ErrorHandler("Invalid warehouseProductId format!", 400));
        }

        const rackData = await rack.findById(rackId);
        if (!rackData)
            return next(new ErrorHandler("Rack not found!", 404));

        const wp = await warehouseProduct.findById(warehouseProductId);
        if (!wp)
            return next(new ErrorHandler("Warehouse product not found!", 404));

        // if (rackData.warehouseId.toString() !== wp.warehouseId.toString()) {
        //     return next(new ErrorHandler("This product does NOT belong to this warehouse!", 400));
        // }

        const isAlready = await rackProducts.findOne({ rackId, warehouseProductId });
        if (isAlready) {
            return next(new ErrorHandler("Product already in this rack", 400));
        }

        const created = await rackProducts.create({
            rackId,
            warehouseProductId,
            quantity
        });

        res.status(200).json({
            success: true,
            message: "Product added to rack!",
            created
        });

    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};


export const updateProductToRack = async (req, res, next) => {
    try {
        const rackId = req.params.id;
        const { warehouseProductId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(rackId)) {
            return next(new ErrorHandler("Invalid rackId format!", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(warehouseProductId)) {
            return next(new ErrorHandler("Invalid warehouseProductId format!", 400));
        }

       
        const rackExists = await rack.findById(rackId);
        if (!rackExists)
            return next(new ErrorHandler("Rack not found!", 404));

      
        const product = await warehouseProduct.findById(warehouseProductId);
        if (!product)
            return next(new ErrorHandler("Warehouse product not found!", 404));

       
        // if (product.warehouseId.toString() !== rackExists.warehouseId.toString()) {
        //     return next(new ErrorHandler("Product does not belong to this warehouse!", 400));
        // }

        const rackData = await rackProducts.findOne({ rackId, warehouseProductId });
        if (!rackData) {
            return next(new ErrorHandler("Product not found in this rack!", 404));
        }

        rackData.quantity = quantity;
        await rackData.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            rackData
        });

    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};



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

