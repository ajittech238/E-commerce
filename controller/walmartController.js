import axios from "axios";
import crypto from "crypto";
import { warehouseProduct } from "../model/warehouseProductModel.js";
import { warehouseOrder } from "../model/warehouseOrderModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";

// ENV VALIDATION
const validateEnv = (keys = []) => {
  keys.forEach((key) => {
    if (!process.env[key]) {
      throw new ErrorHandler(`Missing env variable: ${key}`, 500);
    }
  });
};

// WALMART CLIENT
const createWalmartClient = () => {
  validateEnv([
    "WALMART_CONSUMER_ID",
    "WALMART_PRIVATE_KEY",
  ]);

  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", process.env.WALMART_PRIVATE_KEY)
    .update(process.env.WALMART_CONSUMER_ID + "\n" + timestamp + "\n" + process.env.WALMART_PRIVATE_KEY + "\n")
    .digest("base64");

  const instance = axios.create({
    baseURL: "https://marketplace.walmartapis.com/v3",
    headers: {
      "WM_SVC.NAME": "Walmart Marketplace",
      "WM_QOS.CORRELATION_ID": crypto.randomUUID(),
      "WM_SEC.TIMESTAMP": timestamp,
      "WM_CONSUMER.ID": process.env.WALMART_CONSUMER_ID,
      "WM_SEC.AUTH_SIGNATURE": signature,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return instance;
};

// WALMART CONTROLLER
export const walmartController = {

  // GET PRODUCTS
  getWalmartProducts: async (req, res, next) => {
    try {
      const client = createWalmartClient();
      const response = await client.get("/items");

      return res.status(200).json({
        success: true,
        products: response.data,
      });

    } catch (err) {
      next(new ErrorHandler(err.response?.data || err.message, 500));
    }
  },

  // CREATE PRODUCT FROM WAREHOUSE TO WALMART
  createWalmartProduct: async (req, res, next) => {
    try {
      const { warehouseProductId } = req.params;
      if (!warehouseProductId)
        return next(new ErrorHandler("warehouseProductId is required", 400));

      const product = await warehouseProduct.findById(warehouseProductId)
        .populate("productId", "name price images");

      if (!product)
        return next(new ErrorHandler("Warehouse product not found", 404));

      const client = createWalmartClient();

      const payload = {
        product: {
          sku: product.sku,
          productName: product.productId.name,
          shortDescription: product.productId.name,
          price: product.productId.price,
          brand: "Warehouse",
          images: product.productId.images,
        }
      };

      const response = await client.post("/items", payload);

      res.status(200).json({
        success: true,
        message: "Product created on Walmart",
        walmartProduct: response.data
      });

    } catch (err) {
      next(new ErrorHandler(err.response?.data || err.message, 500));
    }
  },

  // UPDATE INVENTORY
  updateInventory: async (req, res, next) => {
    try {
      const { sku, quantity } = req.body;
      if (!sku || quantity == null)
        return next(new ErrorHandler("sku & quantity required", 400));

      const client = createWalmartClient();

      const payload = {
        sku,
        quantity,
      };

      const response = await client.post("/inventory", payload);

      res.status(200).json({
        success: true,
        message: "Inventory updated",
        inventory: response.data
      });

    } catch (err) {
      next(new ErrorHandler(err.response?.data || err.message, 500));
    }
  },

  // FETCH ORDERS & SAVE TO WAREHOUSE ORDER
  fetchWalmartOrders: async (req, res, next) => {
    try {
      const { warehouseId } = req.body;
      if (!warehouseId) return next(new ErrorHandler("warehouseId required", 400));

      const client = createWalmartClient();
      const response = await client.get("/orders?status=Created");

      const orders = response.data?.list?.elements || [];

      if (!orders.length)
        return next(new ErrorHandler("No Walmart orders found", 404));

      const savedOrders = [];

      for (const order of orders) {
        const items = order.orderLines?.orderLine?.map((i) => ({
          warehouseProduct: i.item.sku,
          quantity: i.orderLineQuantity?.amount,
          unitPrice: i.charges?.charge[0]?.chargeAmount?.amount || 0
        })) || [];

        const newOrder = await warehouseOrder.create({
          sellerId: req.user?._id,
          warehouseId,
          items,
          totalAmount: order.orderTotal?.amount || 0,
          paymentStatus: order.paymentTypes || "pending",
          status: order.orderStatus || "pending",
          shippingAddress: order.shippingInfo || {},
        });

        savedOrders.push(newOrder);
      }

      return res.status(200).json({
        success: true,
        message: "Walmart orders synced successfully",
        savedOrders
      });

    } catch (err) {
      next(new ErrorHandler(err.response?.data || err.message, 500));
    }
  },

  // BULK CREATE ALL WAREHOUSE PRODUCTS
  bulkCreateProducts: async (req, res, next) => {
    try {
      const products = await warehouseProduct
        .find()
        .populate("productId", "name price images");

      const client = createWalmartClient();
      const created = [];

      for (const product of products) {
        const payload = {
          product: {
            sku: product.sku,
            productName: product.productId.name,
            shortDescription: product.productId.name,
            price: product.productId.price,
            brand: "Warehouse",
            images: product.productId.images,
          }
        };

        const response = await client.post("/items", payload);
        created.push(response.data);
      }

      res.status(200).json({
        success: true,
        message: `Created ${created.length} products on Walmart`,
        createdProducts: created
      });

    } catch (err) {
      next(new ErrorHandler(err.response?.data || err.message, 500));
    }
  }
};
