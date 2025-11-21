import mongoose from "mongoose"
import { warehouse } from "../model/warehouseModel.js"
import { warehouseProduct } from "../model/warehouseProductModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"
import { warehouseCart } from "../model/warehouseCartModel.js"
import { user } from "../model/userModel.js"
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { warehouseOrder } from "../model/warehouseOrderModel.js"
import { RazorpayInstance } from "../services/razorpayInstance.js"
import { warehouseReturnandRefund } from "../model/warehouseReturn&RefundModel.js";

import { warehouseInvoice } from "../model/warehouseInvoiceModel.js"



export const createWarehouse = async (req, res, next) => {
    try {

        const { name, location, warehouseNo, managerId } = req.body

        if (!name || !warehouseNo || !managerId) {
            return next(new ErrorHandler("name, warehouseNo and managerId are required", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(managerId)) {
            return next(new ErrorHandler("Invalid managerId", 400));

        }

        const manager = await user.findById(managerId);
        if (!manager) return next(new ErrorHandler("Manager not found", 404));

        const iswarehouseExits = await warehouse.findOne({ warehouseNo: warehouseNo })

        if (iswarehouseExits) {
            return next(new ErrorHandler("warehouse already exits with this No"))
        }

        const warehouseData = await warehouse.create({
            name: name,
            location: location,
            warehouseNo: warehouseNo,

            manager: managerId
        })

        await warehouseData.save()

        res.status(200).json({
            success: true,
            warehouseData
        })
    } catch (err) {
        console.error(err)
        next(new ErrorHandler(err.message, 500))
    }
}



export const getOneWarehouse = async (req, res, next) => {
    try {

        const warehouseNo = req.params.No

        if (!warehouseNo) return next(new ErrorHandler("Warehouse No param required", 400));

        const warehouseData = await warehouse.findOne({ warehouseNo: warehouseNo }).populate("manager", 'userName email role')

        if (!warehouseData) return next(new ErrorHandler("Warehouse not found", 404));
        res.status(200).json({
            success: true,
            warehouseData
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

export const getAllWarehouse = async (req, res, next) => {
    try {
        const warehouseData = await warehouse.find({}).populate("manager", 'userName email role')
        res.status(200).json({
            success: true,
            warehouseData
        })
    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const editWarehouse = async (req, res, next) => {
    try {
        const warehouseNo = req.params.No
        const { name, location, managerId } = req.body

        if (!warehouseNo) return next(new ErrorHandler("Warehouse No param required", 400));
        if (!name && !location && !managerId) {
            return next(new ErrorHandler("Please fill at least one field to update", 400));
        }
        const warehouseData = await warehouse.findOne({ warehouseNo: warehouseNo }).populate("manager", 'userName email role')

        if (!warehouseData) return next(new ErrorHandler("Warehouse not found", 404));

        if (managerId) {
            if (!mongoose.Types.ObjectId.isValid(managerId)) {
                return next(new ErrorHandler("Invalid managerId", 400));
            }
            const manager = await user.findById(managerId);
            if (!manager) return next(new ErrorHandler("Manager not found", 404));
            warehouseData.manager = managerId;
        }


        if (name) warehouseData.name = name
        if (location) warehouseData.location = location
        if (managerId) warehouseData.manager = managerId

        await warehouseData.save()

        res.status(200).json({
            success: true,
            warehouseData
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

// product management in warehouse

export const getProductOfWarehouse = async (req, res, next) => {
    try {

        const { warehouseNo } = req.params
        if (!warehouseNo) return next(new ErrorHandler("warehouseNo param required", 400));
        const warehousedata = await warehouse.findOne({ warehouseNo: warehouseNo })
        if (!warehousedata) return next(new ErrorHandler("Invalid warehouse No", 404));
        const warehouseProductData = await warehouseProduct.find({ warehouseId: warehousedata._id })

        res.status(200).json({
            success: true,
            warehouseProductData
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

export const addProductToWarehouse = async (req, res, next) => {
    try {
        const { warehouseNo } = req.params
        const { productId, sku, quantity, costPrice, expiryDate, batchNumber } = req.body
        if (!warehouseNo) return next(new ErrorHandler("warehouseNo param required", 400));

        if (!productId || !sku) return next(new ErrorHandler("productId and sku are required", 400));
        const warehouseData = await warehouse.findOne({ warehouseNo: warehouseNo })

        if (!warehouseData) return next(new ErrorHandler("Invalid warehouseNo", 404));
        const isalreadyProductExits = await warehouseProduct.findOne({ warehouseId: warehouseData._id, sku: sku })

        if (isalreadyProductExits) {
            return next(new ErrorHandler("product is already in warehouse", 400))
        }

        const warehouseProductData = await warehouseProduct.create({
            warehouseId: warehouseData._id,
            productId,
            sku,
            quantity,
            costPrice,
            expiryDate,
            batchNumber
        })

        res.status(201).json({
            success: true,
            message: "product added to warehouse successfully !",
            warehouseProductData
        })



    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const updateProductToWarehouse = async (req, res, next) => {
    try {

        const { warehouseNo, productId } = req.params

        const { sku, quantity, costPrice, expiryDate, batchNumber } = req.body

        if (!warehouseNo || !productId) return next(new ErrorHandler("warehouseNo and productId are required", 400));
        if (!sku && quantity === undefined && costPrice === undefined && !expiryDate && !batchNumber) {
            return next(new ErrorHandler("At least one field to update is required", 400));
        }
        const filter = {}

        if (sku) filter.sku = sku
        if (quantity !== undefined) filter.quantity = quantity
        if (costPrice !== undefined) filter.costPrice = costPrice
        if (expiryDate) filter.expiryDate = expiryDate
        if (batchNumber) filter.batchNumber = batchNumber

        const warehouseData = await warehouse.findOne({ warehouseNo: warehouseNo })

        if (!warehouseData) return next(new ErrorHandler("Invalid warehouse No", 404));

        const warehouseProductData = await warehouseProduct.findOneAndUpdate({ warehouseId: warehouseData._id, productId: productId },
            { $set: filter },
            { new: true }
        )

        if (!warehouseProductData) return next(new ErrorHandler("Warehouse product not found", 404));

        res.status(200).json({
            success: true,
            message: "product updated in warehouse !",
            warehouseProductData
        })



    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const deleteProductToWarehouse = async (req, res, next) => {
    try {

        const { warehouseNo, productId } = req.params
        if (!warehouseNo || !productId) return next(new ErrorHandler("warehouseNo and productId required", 400));

        const warehouseData = await warehouse.findOne({ warehouseNo: warehouseNo })

        if (!warehouseData) return next(new ErrorHandler("Invalid warehouse No", 404));
        const warehouseProductData = await warehouseProduct.findOneAndDelete({ warehouseId: warehouseData._id, productId: productId })

        if (!warehouseProductData) return next(new ErrorHandler("Product was already deleted or not found", 404));
        res.status(200).json({
            success: true,
            message: "product deleted successfully !"
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

//warehouse product cart 

export const addToWarehouseCart = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const { warehouseProductId, quantity } = req.body;

        if (!warehouseProductId)
            return next(new ErrorHandler("warehouseProductId required", 400));

        if (!mongoose.Types.ObjectId.isValid(warehouseProductId))
            return next(new ErrorHandler("Invalid warehouseProductId", 400));

        const isValidWarehouseProduct = await warehouseProduct.findById(warehouseProductId);

        if (!isValidWarehouseProduct) {
            return next(new ErrorHandler("warehouseProductId is not a valid warehouse product", 400));
        }

        let cart = await warehouseCart.findOne({ sellerId });

        if (!cart) {
            cart = await warehouseCart.create({
                sellerId,
                items: [{ warehouseProductId, quantity }]
            });
        } else {
            const item = cart.items.find(i => i.warehouseProductId.equals(warehouseProductId));

            if (item) item.quantity = quantity;
            else cart.items.push({ warehouseProductId, quantity });

            await cart.save();
        }

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart
        });

    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};





export const getToWarehouseCart = async (req, res, next) => {
    try {

        const sellerId = req.user._id

        const cartData = await warehouseCart.find({ sellerId: sellerId })


        res.status(200).json({
            success: true,
            cartData
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}

export const updateToWarehouseCart = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const { warehouseProductId } = req.body;

        if (!warehouseProductId)
            return next(new ErrorHandler("warehouseProductId required", 400));

        const product = await warehouseProduct.findById(warehouseProductId);
        if (!product)
            return next(new ErrorHandler("Invalid warehouseProductId", 400));

        let cart = await warehouseCart.findOne({ sellerId });

        if (!cart) {
            cart = await warehouseCart.create({
                sellerId,
                items: [{ warehouseProductId, quantity: 1 }]
            });

            return res.status(200).json({
                success: true,
                message: "Product added to new cart!",
                cart
            });
        }

        const existingItem = cart.items.find(item =>
            item.warehouseProductId.equals(warehouseProductId)
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Add new product
            cart.items.push({
                warehouseProductId,
                quantity: 1
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: existingItem
                ? "Product quantity updated!"
                : "Product added to cart!",
            cart
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler(err.message, 500));
    }
};



export const removeFromWarehouseCart = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const { warehouseProductId } = req.body;

        if (!warehouseProductId)
            return next(new ErrorHandler("warehouseProductId required", 400));

        let cart = await warehouseCart.findOne({ sellerId });
        if (!cart) return next(new ErrorHandler("Cart not found", 404));

        cart.items = cart.items.filter(
            (item) => item.warehouseProductId.toString() !== warehouseProductId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product removed from cart!",
            cart
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler(err.message, 500));
    }
};




export const clearWarehouseCart = async (req, res, next) => {
    try {
        const sellerId = req.user._id;

        const deleted = await warehouseCart.deleteMany({ sellerId });

        if (deleted.deletedCount === 0)
            return next(new ErrorHandler("Cart not found", 404));

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully!"
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler(err.message, 500));
    }
};

//warehouse order Controller

export const getWarehouseOrder = async (req, res, next) => {
    try {
        const sellerId = req.user._id

        const warehouseOrderData = await warehouseOrder.find({ sellerId: sellerId }).populate({
            path: 'items.warehouseProduct',
            populate: {
                path: "productId",
                model: "productDetails"
            }
        })

        res.status(200).json({
            success: true,
            warehouseOrderData
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const createWarehouseOrder = async (req, res, next) => {
    try {

        const sellerId = req.user._id
        const { warehouseId, shippingAddress } = req.body

        if (!warehouseId || !shippingAddress) {
            return next(new ErrorHandler("warehouseId and shippingAddress are required", 400));
        }

        const warehouseCartData = await warehouseCart.findOne({ sellerId: sellerId }).populate({
            path: 'items.warehouseProductId',
            populate: {
                path: "productId",
                model: "productDetails"
            }
        })
        if (!warehouseCartData || !warehouseCartData.items.length) {
            return next(new ErrorHandler("Cart is empty", 400));
        }


        // const warehouseProductData = await warehouseProduct.findOne({_id : warehouseProductId})
        const finalItems = []
        let totalAmount = 0
        for (let data of warehouseCartData.items) {
            finalItems.push({ warehouseProduct: data.warehouseProductId, quantity: data.quantity, unitPrice: data.warehouseProductId.costPrice })
            totalAmount += parseInt(data.warehouseProductId.costPrice * data.quantity)
        }


        const warehouseOrderData = await warehouseOrder.create({
            sellerId,
            warehouseId,
            items: finalItems,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress
        })


        res.status(200).json({
            success: true,
            warehouseOrderData
        })

        await warehouseCartData.deleteOne()


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const updateWarehouseOrder = async (req, res, next) => {
    try {



        const { warehouseOrderId } = req.params
        const { shippingAddress, status } = req.body

        if (!warehouseOrderId) return next(new ErrorHandler("warehouseOrderId param required", 400));
        if (!shippingAddress && !status) {
            return next(new ErrorHandler("Please provide shippingAddress or status to update", 400));
        }

        const updateData = {}

        if (shippingAddress) updateData.shippingAddress = shippingAddress
        if (status) updateData.status = status

        const warehouseOrderData = await warehouseOrder.findOneAndUpdate({ _id: warehouseOrderId }, {
            $set: updateData
        },
            { new: true, runValidators: true })

        if (!warehouseOrderData) return next(new ErrorHandler("Order not found", 404));
        res.status(200).json({
            success: true,
            message: "warehouse order updated Successfully !",
            warehouseOrderData
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


//warehouse payment

export const createrazorpayOrder = async (req, res, next) => {
    try {

        const sellerId = req.user._id
        const { warehouseId, shippingAddress } = req.body
        if (!warehouseId) return next(new ErrorHandler("warehouseId required", 400));


        const warehouseCartData = await warehouseCart.findOne({ sellerId: sellerId }).populate('items.warehouseProductId')

        if (!warehouseCartData || !warehouseCartData.items.length) {
            return next(new ErrorHandler("cart is empty", 400));
        }

        if (!warehouseId || !shippingAddress)
            return next(new ErrorHandler("please fill all the required fields!", 400))

        // const warehouseProductData = await warehouseProduct.findOne({_id : warehouseProductId})
        const finalItems = []
        let totalAmount = 0
        for (let data of warehouseCartData.items) {
            finalItems.push({ warehouseProduct: data.warehouseProductId, quantity: data.quantity, unitPrice: data.warehouseProductId.costPrice })
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
            console.log(expectedSignature)

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

        //  clear cart after order
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


export const createInvoiceforWarehouse = async (req, res, next) => {
    try {

        const { warehouseOrderId } = req.params
        if (!warehouseOrderId) return next(new ErrorHandler("warehouseOrderId param required", 400));

        const warehouseOrderData = await warehouseOrder.findOne({ _id: warehouseOrderId }).populate({
            path: 'items.warehouseProduct',
            select: 'productId sku',
            populate: {
                path: 'productId',
                select: 'images name'
            }
        })

        //  if(warehouseOrderData.status !== "delivered"){
        //     return next(new ErrorHandler("invoice will created after product delivered !", 400))
        //  }


        if (!warehouseOrderData) return next(new ErrorHandler("Invalid warehouse order id", 404));
        const isInvoiceExits = await warehouseInvoice.findOne({ warehouseOrderId: warehouseOrderId })

        if (isInvoiceExits) {
            return next(new ErrorHandler("invoice already created !", 400))
        }

        const orderItems = []

        for (let item of warehouseOrderData.items) {
            orderItems.push({
                productName: item.warehouseProduct.productId.name,
                sku: item.warehouseProduct.sku,
                quantity: item.quantity,
                price: item.unitPrice
            })
        }
        const invoiceData = await warehouseInvoice.create({
            sellerId: warehouseOrderData.sellerId,
            warehouseId: warehouseOrderData.warehouseId,
            warehouseOrderId: warehouseOrderId,
            items: orderItems,
            shippingAddress: warehouseOrderData.shippingAddress,
            totalAmount: warehouseOrderData.totalAmount
        })

        res.status(200).json({
            success: true,
            message: "invoice created successfully !",
            invoiceData
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to create invoice", 500))
    }
}


export const getInvoiceOfWarehouse = async (req, res, next) => {
    try {

        const { warehouseOrderId } = req.params
        console.log(warehouseOrderId)
        if (!warehouseOrderId) return next(new ErrorHandler("warehouseOrderId param required", 400));

        const invoiceData = await warehouseInvoice.findOne({ warehouseOrderId: warehouseOrderId }).populate('sellerId', 'userName email role phoneNumber').populate("warehouseId", 'name location')


        if (!invoiceData) return next(new ErrorHandler("Invalid invoice id", 404));
        res.status(200).json({
            success: true,
            invoiceData
        })


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler("failed to create invoice", 500))
    }
}


// warehouse return and refund





//  Create New Return Request
export const requestReturn = async (req, res, next) => {
    try {
        const sellerId = req.user._id;
        const { warehouseOrderId, returnReason } = req.body;

        if (!warehouseOrderId || !returnReason) {
            return next(new ErrorHandler("Order ID & return reason required", 400));
        }

        const order = await warehouseOrder.findById(warehouseOrderId);
        if (!order) return next(new ErrorHandler("Invalid warehouse order!", 404));

        const data = await warehouseReturnandRefund.create({
            sellerId,
            warehouseOrderId,
            returnReason,
        });

        res.status(200).json({
            success: true,
            message: "Return request submitted!",
            data,
        });
    } catch (err) {
        console.error(err);
        return next(new ErrorHandler("Failed to submit return request", 500));
    }
};


//  Admin Approves / Rejects Return Request
export const updateReturnStatus = async (req, res, next) => {
    try {
        const { requestId, status, rejectReason } = req.body;

        if (!requestId || !status) {
            return next(new ErrorHandler("Request ID & Status required!", 400));
        }

        const allowStatus = ["pending", "approved", "rejected"];
        if (!allowStatus.includes(status)) {
            return next(new ErrorHandler("Invalid return status!", 400));
        }

        const requestData = await warehouseReturnandRefund.findById(requestId);
        if (!requestData) return next(new ErrorHandler("Request not found!", 404));

        requestData.status = status;

        if (status === "rejected" && rejectReason) {
            requestData.rejectReason = rejectReason;
            requestData.returnStatus = "closed";
        }

        if (status === "approved") {
            requestData.returnStatus = "progress";
        }

        await requestData.save();

        res.status(200).json({
            success: true,
            message: "Return status updated!",
            data: requestData,
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler("Failed to update return status", 500));
    }
};


//  Mark Return Completed (Admin)
export const completeReturnProcess = async (req, res, next) => {
    try {
        const { requestId, returnDetails } = req.body;

        if (!requestId) return next(new ErrorHandler("Request ID is required!", 400));

        const requestData = await warehouseReturnandRefund.findById(requestId);
        if (!requestData) return next(new ErrorHandler("Request not found!", 404));

        requestData.returnStatus = "returned";
        requestData.returnDetails = returnDetails || {};

        await requestData.save();

        res.status(200).json({
            success: true,
            message: "Return completed successfully!",
            data: requestData,
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler("Failed to complete return", 500));
    }
};


//  Process Refund (Wallet / Razorpay)
export const processRefund = async (req, res, next) => {
    try {
        const { requestId, method, amount, refundDetails } = req.body;

        if (!requestId || !method || !amount) {
            return next(new ErrorHandler("Request ID, method & amount required!", 400));
        }

        const allowedMethods = ["wallet", "razorpay"];
        if (!allowedMethods.includes(method)) {
            return next(new ErrorHandler("Invalid refund method!", 400));
        }

        const requestData = await warehouseReturnandRefund.findById(requestId);
        if (!requestData) return next(new ErrorHandler("Request not found!", 404));

        const seller = await user.findById(requestData.sellerId);
        if (!seller) return next(new ErrorHandler("Seller not found!", 404));

        if (method === "wallet") {
            seller.walletBalance += amount;
            await seller.save();

            requestData.refundStatus = "refundedToWallet";
        }

        if (method === "razorpay") {
            // Razorpay Integration (mock)
            requestData.refundStatus = "refundedByRazorpay";
        }

        requestData.refundDetails = refundDetails || {};

        await requestData.save();

        res.status(200).json({
            success: true,
            message: "Refund processed!",
            data: requestData,
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler("Failed to process refund", 500));
    }
};


//  Get All Requests (Admin / Seller)
export const getAllReturnRefundRequests = async (req, res, next) => {
    try {
        const { status, sellerId } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (sellerId) filter.sellerId = sellerId;

        const data = await warehouseReturnandRefund.find(filter).populate("sellerId warehouseOrderId");

        res.status(200).json({
            success: true,
            count: data.length,
            data,
        });

    } catch (err) {
        console.error(err);
        return next(new ErrorHandler("Failed to fetch return/refund data", 500));
    }
};

