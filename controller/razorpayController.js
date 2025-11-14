import crypto from "crypto";
import { order } from "../model/orderModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";
import { Cart } from "../model/cartModel.js";
import { productDetails } from "../model/productModel.js";
import { user } from "../model/userModel.js";
import { notification } from "../model/notificationModel.js";
import { assignreward } from "./scratchCardController.js";
import { RazorpayInstance } from "../services/razorpayInstance.js";

export const createRazorpayOrderAndVerify = async (req, res, next) => {
    try {

        let totalAmount = 0
        let discountedPrice = 0
        let walletamount = 0

        const userId = req.user._id;
        const usercart = await Cart.findOne({ userId })
        const { shippingAddress, paymetnMethod } = req.body

        if (!usercart || usercart.items.length == 0) {
            return next(new ErrorHandler("cart is empty !", 200))
        }

        const couponDiscount = usercart.couponDiscount

        if (!shippingAddress) {
        }

        if(paymetnMethod !== 'Online'){
            return next(new ErrorHandler("choose correct payment Method !", 400))
        }

        const finalOrderitem = []

        const userData = await user.findOne({ _id: userId })

        if (userData.isWalletApplied) {
            walletamount = userData.walletBalance
        }

        for (let item of usercart.items) {
            let product = await productDetails.findById(item.productId)
            if (!product) {
                return next(new ErrorHandler("product not found", 200))
            }

            totalAmount += product.price * item.quantity

            finalOrderitem.push({
                product: item.productId,
                quantity: item.quantity
            })
            discountedPrice = parseInt(totalAmount - (totalAmount * product.currentDiscount) / 100);
        }


        let finalAmount = discountedPrice - walletamount;

        if (couponDiscount != 0) {
            finalAmount = parseInt(finalAmount - finalAmount * couponDiscount / 100)
        }

        

        const options = {
            amount: finalAmount * 100, // amount in the smallest currency unit
            currency: "INR",
        };

        const razorpayInstance = await RazorpayInstance()

        const razorpayOrder = await razorpayInstance.orders.create(options);


        res.status(200).json({
            success: true,
            order: razorpayOrder,
            finalOrderitem,
            shippingAddress,
            OrignalAmount: parseInt(totalAmount),
            productPrice: discountedPrice,
            finalAmount: parseInt(finalAmount),
            couponDiscount: couponDiscount,
            usedWalletAmount: walletamount,
        });

    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
    }
}

export const verifyPaymentAndCreateOrder = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress, paymentMethod } = req.body || {};


        const userId = req.user._id
        const usercart = await Cart.findOne({userId})
                return next(new ErrorHandler("cart is empty !", 200))

        

        if(paymentMethod !== 'Online'){
            return next(new ErrorHandler('choose correct payment method !', 400))
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            
        let totalAmount = 0
        let discountedPrice = 0
        let walletamount = 0

        const couponDiscount = usercart.couponDiscount

        
            const finalOrderitem = []
        
            const userData = await user.findOne({_id : userId})
            const eventData = await event.findOne({iseventActive : true})


            if(userData.isWalletApplied){
                walletamount = userData.walletBalance
            }

          
    totalAmount += product.price*item.quantity
    
    finalOrderitem.push({
        product : item.productId,
        quantity : item.quantity
    })
        discountedPrice = parseInt(totalAmount -  (totalAmount*product.currentDiscount)/100);
   
    

    let finalAmount = discountedPrice - walletamount;
    
    if(couponDiscount != 0){
        finalAmount =  parseInt(finalAmount - finalAmount*couponDiscount/100)
    }
            const data = await order.create({
                user: userId,
                orderItems: finalOrderitem,
                shippingAddress: shippingAddress,
                OrignalAmount: totalAmount, 
                productPrice: discountedPrice, 
                finalAmount: finalAmount, 
                couponDiscount: couponDiscount,
                usedWalletAmount: walletamount,
                paymentStatus: "paid",
                shippingStatus: "processing",
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            })

            console.log("Attempting to delete cart for user:", req.user._id);
            const cartDeletionResult = await Cart.findOneAndDelete({ userId: req.user._id });
            if (cartDeletionResult) {
                console.log("Cart deleted successfully for user:", req.user._id);
            } else {
                console.log("Cart not found or already deleted for user:", req.user._id);
            }

            await notification.create({
                user: req.user._id,
                title: "order created",
                message: "order confirmed !",
                type: "order"
            })

            if (walletamount != 0) {
                userData.walletBalance = 0
                userData.isWalletApplied = false
                
                await userData.save()
            }

            const scratch_card = await assignreward(req.user._id, data._id)

            res.status(201).json({
                success: true,
                message: "order confirmed !",
                data,
                scratch_card
            })
        }
         else {
            return next(new ErrorHandler("Payment verification failed", 400));
        }
    }
    catch (err) {
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
    }
}
