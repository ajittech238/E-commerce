import mongoose from "mongoose";
import { Cart } from "../model/cartModel.js"
import { productDetails } from "../model/productModel.js";
import { user } from "../model/userModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";
import { event } from "../model/eventModel.js";

export const addToCart = async (req, res, next) => {
    try {
        const userId = req.user._id
        const { productId, quantity, couponCode } = req.body


        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new ErrorHandler("Enter valid product ID!", 400));
        }

        let cart = await Cart.findOne({ userId });
        cart = new Cart({
            userId, items: [{
                productId, quantity
            }]
        })

        const existProduct = await productDetails.findOne({ _id: productId })

        if (!existProduct) {
            return next(new ErrorHandler("Product not found!", 404));
        }


        const existingItem = cart.items.find(item => item.productId.equals(productId))

        if (existingItem) {
            existingItem.quantity = quantity
        }
        else {
            cart.items.push({
                productId, quantity
            })
        }

        await cart.save()

        res.status(200).send({
            success: true,
            message: "item added to cart",
            cart
        })


    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}

export const getToCart = async (req, res, next) => {
    try {
        const userId = req.user._id

        let cart = await Cart.findOne({ userId }).populate('items.productId', 'name shopName price discount currentDiscount category itemTag shippingTag')
        if (!cart || cart.items.length === 0) {
            return next(new ErrorHandler("Cart is empty!", 200));
        }
        const eventData = await event.findOne({ iseventActive: true })


        let totalprice = 0
        let total_discount = 0
        let totalamount = 0
        let walletamount = 0

        cart.items.forEach((item) => {

            total_discount += ((item.productId.price * item.productId.currentDiscount * item.quantity) / 100)

            totalamount += (item.productId.price * item.quantity)
        })

        const userData = await user.findOne({ _id: userId })

        if (userData.isWalletApplied) {

            
            walletamount = userData.walletBalance
        }

        totalprice = parseInt(totalamount - total_discount - walletamount)


        const newCoupon_discount = (Math.round(totalprice * cart.couponDiscount / 100))

        totalprice = parseInt(totalprice - totalprice * cart.couponDiscount / 100)


        res.status(200).send({
            success: true,
            cart,
            orignalprice: totalamount,
            totalAmount: totalprice,
            discount: Math.round(total_discount),
            usedwalletamount: walletamount,
            couponDiscount: newCoupon_discount
        })

    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}


export const removeToCart = async (req, res, next) => {
    try {
        const userId = req.user._id
        const { productId } = req.body || {}

        let cart = await Cart.findOne({ userId }).populate("items.productId")

        if (!cart) {
            return next(new ErrorHandler("Cart not found!", 404));
        }

        cart.items = cart.items.filter(item => !item.productId.equals(productId))
        await cart.save()

        await cart.deleteOne({ userId: userId })

        res.status(200).send({
            success: true,
            message: "item removed successfully !"
        })

    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}


export const updateCartItemQuantity = async (req, res, next) => {
    try {
        const userId = req.user._id
        const { productId, quantity } = req.body;

        if (quantity <= 0) {
            return next(new ErrorHandler("Please provide valid quantity!", 400));
        }

        let cart = await Cart.findOne({ userId })

        if (!cart) return next(new ErrorHandler("Cart not found!", 404));

        let item = cart.items.find(item => item.productId.equals(productId))


        if (!item) return next(new ErrorHandler("Product not found in cart!", 404));

        if (quantity <= 0) {
            cart.items = cart.items.filter(item => !item.productId.equals(productId))
        }
        else {
            item.quantity = quantity
        }

        await cart.save()
        res.status(200).send({
            success: true,
            cart
        })

    }
    catch (err) {
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}


export const clearCart = async (req, res, next) => {
    try {
        const userId = req.user._id
        let cart = await Cart.findOneAndDelete({ userId })

        if (!cart) {
            return next(new ErrorHandler("Cart already cleared!", 200));
        } 
        res.status(200).send({
            success: true,
            message: "cart is cleared !"
        })

    }
    catch (err) {
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}

