import { productDetails } from "../model/productModel.js"
import { shop } from "../model/shopModel.js"
import { user } from "../model/userModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const createshop = async (req, res, next) => {
    try {
        const userId = req.user._id
        const {
            shopName,
            location,
            contactNumber,
        } = req.body

        if (!shopName || !location || !contactNumber) {
            return next(new ErrorHandler("Shop name, location & contact number are required!", 400));
        }

        const isShopexits = await shop.findOne({ owner: userId })

        if (isShopexits) {
            return next(new ErrorHandler("you have already created shop !", 400))
        }

        const data = await shop.create({
            shopName,
            owner: userId,
            location,
            contactNumber
        })

        await data.save()

        res.status(200).json({
            success: true,
            message: "shop created succssfully !",
            data
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}



export const getMyShop = async (req, res, next) => {
    try {
        const userId = req.user._id

        const data = await shop.findOne({ owner: userId })

        if (!data) {
            return next(new ErrorHandler("Shop not found!", 404));
        }

        res.status(200).json({
            success: true,
            data
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}


export const getAllShop = async (req, res, next) => {
    try {


        const data = await shop.find()


        res.status(200).json({
            success: true,
            data
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}




export const getOneShop = async (req, res, next) => {
    try {

        const shopId = req.params.id
        console.log(shopId)
        const data = await shop.findOne({ _id: shopId })

        if (!data) {
            return next(new ErrorHandler("Shop not found!", 404));
        }
        res.status(200).json({
            success: true,
            data
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}


export const getShopProduct = async (req, res, next) => {
    try {

        const shopId = req.params.id
        const data = await shop.findOne({ _id: shopId })

        if (!data) {
            return next(new ErrorHandler("Shop not found!", 404));
        }
        const productData = await productDetails.find({ shopName: data.shopName })



        res.status(200).json({
            success: true,
            productData
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}


export const myshopProduct = async (req, res, next) => {
    try {

        const userId = req.user._id
        const data = await shop.findOne({ owner: userId })

        if (!data) {
            return next(new ErrorHandler("Shop not found!", 404));
        }
        const productData = await productDetails.find({ shopName: data.shopName })



        res.status(200).json({
            success: true,
            productData
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}


export const updateshopDetails = async (req, res, next) => {
    try {
        const shopId = req.params.id
        const { shopName, contactNumber, location, isShopVerified } = req.body


        if (!shopName && !contactNumber && !location && typeof isShopVerified === "undefined") {
            return next(new ErrorHandler("At least one field is required to update!", 400));
        }
        const data = await shop.findOne({ _id: shopId })

        if (shopName) data.shopName = shopName
        if (contactNumber) data.contactNumber = contactNumber
        if (location) data.location = location
        if (isShopVerified) data.isShopVerified = isShopVerified

        await data.save()

        res.status(200).json({
            success: true,
            message: "shop details updated !",
            data
        })



    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}



export const disableShop = async (req, res, next) => {
    try {

        const shopId = req.params.id
        const data = await shop.findOne({ _id: shopId })

        if (!data) {
            return next(new ErrorHandler("Shop not found!", 404));
        }
        if (data.isShopVerified === false) {
            return next(new ErrorHandler("Shop is already disabled!", 400));
        }
        data.isShopVerified = false

        await data.save()
        res.status(200).json({
            success: true,
            message: "shop is disabled"
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}
