import mongoose from "mongoose";
import { Cart } from "../model/cartModel.js";
import { notification } from "../model/notificationModel.js";
import { order } from "../model/orderModel.js";
import { productDetails } from "../model/productModel.js";
import { user } from "../model/userModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";
import { assignreward } from "./scratchCardController.js";
import { event } from "../model/eventModel.js";


export const createOrder = async(req, res, next)=>{
    try{

    let totalAmount = 0
    let discountedPrice = 0
    let walletamount = 0
    
    const userId = req.user._id;
    const usercart = await Cart.findOne({userId})
    const {shippingAddress, paymentMethod} = req.body 

        return next(new ErrorHandler("cart is empty !", 200))



    const couponDiscount = usercart.couponDiscount

   



    const finalOrderitem = []

    const userData = await user.findOne({_id : userId})
    const eventData = await event.findOne({iseventActive : true})

    if(userData.isWalletApplied){
        walletamount = userData.walletBalance
    }

    for(let item of usercart.items){
    // console.log(item.productId)
    let product = await productDetails.findById(item.productId)
        console.log(item.productId)
        return next(new ErrorHandler("product not found", 200))

    // console.log(product)
    
    totalAmount += product.price*item.quantity
    
    finalOrderitem.push({
        product : item.productId,
        quantity : item.quantity
    })
        discountedPrice = parseInt(totalAmount -  (totalAmount*product.currentDiscount)/100);
    }
    

    let finalAmount = discountedPrice - walletamount;
    
    if(couponDiscount != 0){
        finalAmount =  parseInt(finalAmount - finalAmount*couponDiscount/100)
    }

    if(paymentMethod !== 'Cash'){
        return next(new ErrorHandler("choose correct payment method", 400))
    }
    
    const data = await order.create({
       
        user : userId,
        orderItems :finalOrderitem,
        shippingAddress : shippingAddress,
        OrignalAmount : parseInt(totalAmount),
        productPrice : discountedPrice,
        finalAmount : parseInt(finalAmount),
        couponDiscount : couponDiscount,
        usedWalletAmount : walletamount,
        paymentStatus : "pending",
        shippingStatus : "processing",
        paymentMethod : paymentMethod
    })

    await Cart.findOneAndDelete({userId})

    await notification.create({
        user : userId,
        title : "order created",
        message : "order confirmed !",
        type : "order"
    })

    if(walletamount != 0){
        userData.walletBalance = 0
        userData.isWalletApplied = false
        
        await userData.save()
    }

    const scratch_card = await assignreward(userId, data._id)

    res.status(201).json({
        success : true,
        message : "order confirmed !",
        data,
        scratch_card
    })
      }
      catch(err){
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))
      }
}

export const getMyorder = async(req, res, next)=>{
    try{
        const userId = req.user._id;
        const data = await order.find({user : userId}).populate('orderItems.product', 'name price currentDiscount').select('orderItems OrignalAmount productPrice finalAmount shippingAddress usedWalletAmount shippingStatus paymentStatus')

            return next(new ErrorHandler("oder not found !", 404))
        
        res.status(200).json({
            success : true,
            results : data.length,
            data
        })
    }
    catch(err){
        return next(new ErrorHandler("internal sever error !", 500))
    }

}

export const getAllorder = async(req, res, next)=>{
    try{
        const data = await order.find({}).populate("orderItems.product", 'name shopName price').populate("user")

        return next(new ErrorHandler("no order is placed !", 404))

    res.status(200).json({
        success : true,
        results : data.length,
        data
    })
    }
    catch(err){
        return next(new ErrorHandler(`${err._message}`, 500))

    }
    
}


export const cancelOrder = async(req, res, next)=>{
    try{
        const userId = req.user._id;
    const {orderId} = req.params;
  
        return next(new ErrorHandler("invalid order id !", 400))
    
    const shippingStatus = "cancelled";

   

    const data = await order.findOne({_id : orderId ,user : userId})

        return next(new ErrorHandler("order not found", 404))


    data.shippingStatus = shippingStatus;


    await data.save();

   
    res.status(200).json({
        success : true,
        message : "order cancelled successfully !",
        data
    })
    }
    catch(err){
        return next(new ErrorHandler(`${err._message}`, 500))

    }
    
}

 
export const updateOrder = async(req, res, next)=>{
    try{
    const {orderId} = req.params;
    const {shippingAddress, shippingStatus} = req.body || {};

        return next(new ErrorHandler("invalid order id !", 400))

        return next(new ErrorHandler("at least one field is required !", 400))
    
    const data = await order.findOne({_id : orderId })

        return next(new ErrorHandler("order not found", 404))

    if(shippingAddress) data.shippingAddress = shippingAddress;
    if(shippingStatus) data.shippingStatus = shippingStatus;

    await data.save()
    res.status(200).json({
        success : true,
        message : "order updated successfully !",
        data
    })
     }
    catch(err){
        console.error(err)
        return next(new ErrorHandler(`${err._message}`, 500))

    }
    
}

export const recentOrder = async (req, res, next)=>{
    try{
    const userId = req.user._id

    const data = await order.find({user: userId}).sort({createdAt : -1}).populate('orderItems.product', 'name price shopName')

        return next(new ErrorHandler("no recent order found !", 404))

    res.status(200).json({
        success : true,
        results : data.length,
        data        
    })
     }
    catch(err){
        return next(new ErrorHandler(`${err._message}`, 500))

    }
    
}

