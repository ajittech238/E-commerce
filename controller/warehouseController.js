import { warehouse } from "../model/warehouseModel.js"
import { warehouseProduct } from "../model/warehouseProductModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"
import { warehouseCart } from "../model/warehouseCartModel.js"
import { user } from "../model/userModel.js"
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { warehouseOrder } from "../model/warehouseOrderModel.js"
import { RazorpayInstance } from "../services/razorpayInstance.js"

import { warehouseInvoice } from "../model/warehouseInvoiceModel.js"



export const createWarehouse = async (req, res, next)=>{
    try {

        const { name , location, warehouseNo, managerId} = req.body


        const iswarehouseExits = await warehouse.findOne({warehouseNo : warehouseNo})

        if(iswarehouseExits){
            return next(new ErrorHandler("warehouse already exits with this No"))
        }

        const warehouseData = await warehouse.create({
            name : name,
            location : location,
            warehouseNo : warehouseNo,
            manager : managerId
        })

        await warehouseData.save()

        res.status(200).json({
            success : true,
            warehouseData
        })        
    } catch (err) {
        console.error(err)
        next(new ErrorHandler(err.message, 500))
    }
}



export const getOneWarehouse = async (req, res, next)=>{
    try {

        const warehouseNo = req.params.No

            return next(new ErrorHandler("no warehouse found", 404))
      
        const warehouseData = await warehouse.findOne({warehouseNo : warehouseNo}).populate("manager", 'userName email role')


        res.status(200).json({
            success : true,
            warehouseData
        })        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

export const getAllWarehouse = async (req, res, next)=>{
    try {
        const warehouseData = await warehouse.find({}).populate("manager", 'userName email role')
        res.status(200).json({
            success : true,
            warehouseData
        })        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const editWarehouse  = async (req, res, next)=>{
    try {
        const warehouseNo = req.params.No
        const {name , location , managerId} = req.body

            return next(new ErrorHandler("please fill atleast one field !", 400))

        const warehouseData = await warehouse.findOne({warehouseNo : warehouseNo}).populate("manager", 'userName email role')

            return next(new ErrorHandler("warehouse not found ",  404))

        if(name) warehouseData.name = name
        if(location) warehouseData.location = location
        if(managerId) warehouseData.manager = managerId

        await warehouseData.save()

        res.status(200).json({
            success : true,
            warehouseData
        })
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

// product management in warehouse

export const getProductOfWarehouse = async (req, res , next)=>{
    try {

        const {warehouseNo} = req.params
        const warehousedata = await warehouse.findOne({warehouseNo : warehouseNo})
            return next(new ErrorHandler("invalid warehouse No", 400))
        const warehouseProductData = await warehouseProduct.find({warehouseId : warehousedata._id})       
        
        res.status(200).json({
            success : true,
            warehouseProductData
        })
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

export const addProductToWarehouse = async (req, res , next)=>{
    try {
        const {warehouseNo} = req.params
        const {productId, sku, quantity, costPrice, expiryDate, batchNumber} = req.body


        const warehouseData = await warehouse.findOne({warehouseNo : warehouseNo})

            return next(new ErrorHandler("invalid warehouseNo", 400))

        const isalreadyProductExits = await warehouseProduct.findOne({warehouseId : warehouseData._id, sku : sku})

        if(isalreadyProductExits){
            return next(new ErrorHandler("product is already in warehouse", 400))
        }

        const warehouseProductData = await warehouseProduct.create({
            warehouseId : warehouseData._id,
            productId,
            sku,
            quantity,
            costPrice,
            expiryDate,
            batchNumber
        })

        res.status(201).json({
            success : true,
            message : "product added to warehouse successfully !",
            warehouseProductData
        })


        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const updateProductToWarehouse = async (req, res , next)=>{
    try {

        const {warehouseNo, productId} = req.params

        const {sku, quantity, costPrice, expiryDate, batchNumber} = req.body

            return next(new ErrorHandler("atleast fill one field to update !", 400))

        const filter = {}

        if(sku) filter.sku = sku
        if(quantity !== undefined) filter.quantity = quantity
        if(costPrice !== undefined) filter.costPrice = costPrice
        if(expiryDate) filter.expiryDate = expiryDate
        if(batchNumber) filter.batchNumber = batchNumber

        const warehouseData = await warehouse.findOne({warehouseNo : warehouseNo})

            return next(new ErrorHandler("invalid warehouse No", 400))

       
        const warehouseProductData = await warehouseProduct.findOneAndUpdate({warehouseId : warehouseData._id, productId : productId},
            {$set : filter},
            {new : true}
        )

            return next(new ErrorHandler("warehouse product not found !", 400))

   
        res.status(200).json({
            success : true,
            message : "product updated in warehouse !",
            warehouseProductData
        })

        
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const deleteProductToWarehouse = async (req, res , next)=>{
    try {

        const {warehouseNo, productId} = req.params

        const warehouseData = await warehouse.findOne({warehouseNo : warehouseNo})

            return next(new ErrorHandler("invaild warehouse No", 400))

        const warehouseProductData = await warehouseProduct.findOneAndDelete({warehouseId : warehouseData._id, productId : productId})

            return next(new ErrorHandler("product was already deleted or not found !", 404))

        res.status(200).json({
            success : true,
            message : "product deleted successfully !"
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

//warehouse product cart 

export const addToWarehouseCart = async (req, res, next)=>{
    try {

        const sellerId  = req.user._id

        const { warehouseProductId , quantity} = req.body


        let cartData = await warehouseCart.findOne({sellerId : sellerId})

            cartData = await warehouseCart.create({
                sellerId,
                items : [{
                    warehouseProductId,
                    quantity
                }]
            })

        const exitingItem = cartData.items.find((item)=>item.warehouseProductId.equals(warehouseProductId))

        if(exitingItem){
            exitingItem.quantity = quantity
        }
        else{
            cartData.items.push({
                warehouseProductId,
                quantity
            })
        }

        await cartData.save()

        res.status(200).json({
            success : true,
            message : "product added to cart !",
            cartData
        })
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const getToWarehouseCart = async (req, res, next)=>{
    try {

     const sellerId = req.user._id

     const cartData = await warehouseCart.find({sellerId : sellerId})


        res.status(200).json({
            success : true,
            cartData
        })
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const updateToWarehouseCart = async (req, res, next)=>{
    try {

        const sellerId  = req.user._id

        const { warehouseProductId } = req.body


        let cartData = await warehouseCart.findOne({sellerId : sellerId})

            cartData = await warehouseCart.create({
                sellerId,
                items : [{
                    warehouseProductId,
                    quantity : 1
                }]
            })

        const exitingItem = cartData.items.find((item)=>item.warehouseProductId.equals(warehouseProductId))

        if(exitingItem){
            exitingItem.quantity += 1
        }
        else{
            cartData.items.push({
                warehouseProductId,
                quantity : 1
            })
        }

        await cartData.save()

        res.status(200).json({
            success : true,
            message : "product updated to cart !",
            cartData
        })
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const removeFromWarehouseCart = async (req, res, next)=>{
    try {

        const sellerId  = req.user._id

        const { warehouseProductId } = req.body


        let cartData = await warehouseCart.findOne({sellerId : sellerId})

            return next(new ErrorHandler("cart not found !", 404))
        cartData.items = cartData.items.filter((item)=>!item.warehouseProductId.equals(warehouseProductId))

        await cartData.save()

        res.status(200).json({
            success : true,
            message : "produc remove from cart !",
            cartData
        })
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}




export const clearWarehouseCart = async (req, res, next)=>{
    try {

        const sellerId  = req.user._id

        let cartData = await warehouseCart.findOneAndDelete({sellerId : sellerId})

            return next(new ErrorHandler("cart not found !", 404))


        res.status(200).json({
            success : true,
            message : " cart cleared successfully !",
        })
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


//warehouse order Controller

export const getWarehouseOrder = async (req, res, next)=>{
    try {
        const sellerId = req.user._id

        const warehouseOrderData = await warehouseOrder.find({sellerId : sellerId}).populate({path : 'items.warehouseProduct',
            populate : {
                path : "productId",
                model : "productDetails"
            }
        })

        res.status(200).json({
            success : true,
            warehouseOrderData
        })
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const createWarehouseOrder = async (req, res, next)=>{
    try {

        const sellerId = req.user._id
        const { warehouseId, shippingAddress } = req.body

        const warehouseCartData = await warehouseCart.findOne({sellerId : sellerId}).populate({path : 'items.warehouseProduct',
            populate : {
                path : "productId",
                model : "productDetails"
            }
        })

            return next(new ErrorHandler("cart is empty", 400))

            return next(new ErrorHandler("please fill all the required fields!", 400))

        // const warehouseProductData = await warehouseProduct.findOne({_id : warehouseProductId})
        const finalItems = []
        let totalAmount = 0
        for(let data of warehouseCartData.items){
            finalItems.push({warehouseProduct : data.warehouseProductId, quantity : data.quantity,unitPrice :  data.warehouseProductId.costPrice})
            totalAmount += parseInt(data.warehouseProductId.costPrice * data.quantity)
        }


        const warehouseOrderData = await warehouseOrder.create({
            sellerId,
            warehouseId,
            items : finalItems,
            totalAmount : totalAmount,
            shippingAddress : shippingAddress
        })

        
        res.status(200).json({
            success : true,
            warehouseOrderData
        })

        await warehouseCartData.deleteOne()

        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const updateWarehouseOrder = async (req, res, next)=>{
    try {

    

       const {warehouseOrderId} = req.params
       const {shippingAddress, status} = req.body

    const updateData = {}

    if(shippingAddress) updateData.shippingAddress = shippingAddress
    if(status) updateData.status = status

        const warehouseOrderData = await warehouseOrder.findOneAndUpdate({_id : warehouseOrderId}, {
            $set : updateData}, 
            {new : true, runValidators : true})


        res.status(200).json({
            success : true,
            message : "warehouse order updated Successfully !",
            warehouseOrderData
        })

        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


//warehouse payment

export const createrazorpayOrder = async(req, res, next)=>{
    try {

          const sellerId = req.user._id
        const { warehouseId, shippingAddress } = req.body

        const warehouseCartData = await warehouseCart.findOne({sellerId : sellerId}).populate('items.warehouseProductId')

            return next(new ErrorHandler("cart is empty", 400))

            return next(new ErrorHandler("please fill all the required fields!", 400))

        // const warehouseProductData = await warehouseProduct.findOne({_id : warehouseProductId})
        const finalItems = []
        let totalAmount = 0
        for(let data of warehouseCartData.items){
            finalItems.push({warehouseProduct : data.warehouseProductId, quantity : data.quantity,unitPrice :  data.warehouseProductId.costPrice})
            totalAmount += parseInt(data.warehouseProductId.costPrice * data.quantity)
        }

         const options = {
            amount: totalAmount * 100, // amount in the smallest currency unit
            currency: "INR",
        };

        const razorpayInstance = await RazorpayInstance()
        
        const razorpayOrder = await razorpayInstance.orders.create(options);
        
        res.status(200).json({
            success: true,
            order: razorpayOrder,
            finalItems,
            shippingAddress,
            totalAmount: parseInt(totalAmount)
        });

        
        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const verifyPaymentOfWarehouse = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      warehouseId,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(
        new ErrorHandler(
          "razorpay_order_id, razorpay_payment_id, razorpay_signature required",
          400
        )
      );
    }

    const sellerId = req.user._id;

    const warehouseCartData = await warehouseCart
      .findOne({ sellerId })
      .populate("items.warehouseProductId");

    if (!warehouseCartData || warehouseCartData.items.length == 0) {
      return next(new ErrorHandler("cart is empty !", 400));
    }

  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return next(new ErrorHandler("payment verification failed!", 400));
    }

    
    const finalItems = [];
    let totalAmount = 0;
    for (let data of warehouseCartData.items) {
      finalItems.push({
        warehouseProduct: data.warehouseProductId,
        quantity: data.quantity,
        unitPrice: data.warehouseProductId.costPrice,
      });
      totalAmount += parseInt(data.warehouseProductId.costPrice * data.quantity);
    }

    const warehouseOrderData = await warehouseOrder.create({
      sellerId,
      warehouseId,
      items: finalItems,
      totalAmount,
      shippingAddress,
      paymentStatus: "paid",
      status: "processing",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // 🛒 clear cart after order
    await warehouseCart.findOneAndDelete({ sellerId });

    res.status(201).json({
      success: true,
      message: "Payment verified and order created successfully!",
      order: warehouseOrderData,
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler(err.message, 500));
  }
};


export const createInvoiceforWarehouse = async (req, res, next)=>{
    try {
        
        const {warehouseOrderId} = req.params
        
        const warehouseOrderData = await warehouseOrder.findOne({_id : warehouseOrderId}).populate({ 
            path : 'items.warehouseProduct', 
            select :  'productId sku',
            populate : {
                path : 'productId',
                select : 'images name'
            }
         })

        //  if(warehouseOrderData.status !== "delivered"){
        //     return next(new ErrorHandler("invoice will created after product delivered !", 400))
        //  }


            return next(new ErrorHandler("order id is inavlid", 400))

        const isInvoiceExits  = await warehouseInvoice.findOne({warehouseOrderId : warehouseOrderId})

        if(isInvoiceExits){
            return next(new ErrorHandler("invoice already created !", 400))
        }

        const orderItems = []

        for(let item of warehouseOrderData.items){
            orderItems.push({
                productName : item.warehouseProduct.productId.name,
                sku : item.warehouseProduct.sku,
                quantity : item.quantity,
                price : item.unitPrice
            })
        }
        const invoiceData = await warehouseInvoice.create({
            sellerId : warehouseOrderData.sellerId,
            warehouseId : warehouseOrderData.warehouseId,
            warehouseOrderId : warehouseOrderId,
            items : orderItems,
            shippingAddress : warehouseOrderData.shippingAddress,
            totalAmount : warehouseOrderData.totalAmount
        })

        res.status(200).json({
            success : true,
            message : "invoice created successfully !",
            invoiceData
        })

        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to create invoice", 500))
    }
}


export const getInvoiceOfWarehouse = async (req, res, next)=>{
    try {
        
        const {warehouseOrderId} = req.params
        console.log(warehouseOrderId)
        
        const invoiceData = await warehouseInvoice.findOne({warehouseOrderId : warehouseOrderId}).populate('sellerId', 'userName email role phoneNumber').populate("warehouseId", 'name location')

            return next(new ErrorHandler("invaild invoice Id", 400))

        res.status(200).json({
            success : true,
            invoiceData
        })

        
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to create invoice", 500))
    }
}


// warehouse return and refund