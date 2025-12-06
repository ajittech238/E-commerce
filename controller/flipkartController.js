import axios from "axios";
import { warehouseProduct } from "../model/warehouseProductModel.js";
import { warehouseOrder } from "../model/warehouseOrderModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";

// ENV VALIDATION
const validateEnv = (keys = []) => {
  keys.forEach((key) => {
    if (!process.env[key]) 
      {
      throw new ErrorHandler(`Missing environment variable: ${key}`, 500);
    }
  });
};

// CREATE FLIPKART API INSTANCE
const createFlipkartClient = () => {
  validateEnv([
    "FLIPKART_APP_ID",
    "FLIPKART_APP_SECRET",
    "FLIPKART_SELLER_ID",
    "FLIPKART_ACCESS_TOKEN",
  ]);

  return axios.create({
    baseURL: "https://api.flipkart.net/sellers",
    headers: {
      Authorization: `Bearer ${process.env.FLIPKART_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
};

// CONTROLLER START
export const flipkartController = {

  // GET PRODUCTS
  getFlipkartProducts: async (req, res, next) => {
    try {
      const client = createFlipkartClient();

      const response = await client.get(
        `/listings/v3/${process.env.FLIPKART_SELLER_ID}`
      );

      return res.status(200).json({
        success: true,
        products: response.data,
      });
    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // SYNC INVENTORY FROM WAREHOUSE TO FLIPKART
  syncProductInventory: async (req, res, next) => {
    try {
      const { warehouseProductId } = req.params;

      if (!warehouseProductId) {
        return next(new ErrorHandler("warehouseProductId is required", 400));
      }

      const product = await warehouseProduct.findById(warehouseProductId);
      if (!product) return next(new ErrorHandler("Warehouse product not found", 404));

      if (!product.sku)
        return next(new ErrorHandler("Product SKU missing", 400));

      const client = createFlipkartClient();

      const payload = {
        skuId: product.sku,
        quantity: product.quantity,
      };

      const response = await client.post(`/inventory/update`, payload);

      return res.status(200).json({
        success: true,
        message: "Inventory synced to Flipkart",
        response: response.data,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // FETCH FLIPKART ORDERS
  fetchFlipkartOrders: async (req, res, next) => {
    try {
      const { warehouseId } = req.body;
      if (!warehouseId)
        return next(new ErrorHandler("warehouseId is required", 400));

      const client = createFlipkartClient();

      const response = await client.get(`/orders`);

      if (!response.data?.orders?.length) {
        return next(new ErrorHandler("No Flipkart orders found", 404));
      }

      const orders = response.data.orders;
      const savedOrders = [];

      for (const o of orders) {
        const newOrder = await warehouseOrder.create({
          sellerId: req.user?._id,
          warehouseId,
          items: [],
          totalAmount: o.totalPrice || 0,
          paymentStatus: "pending",
          status: "pending",
          shippingAddress: o.address || {},
        });

        savedOrders.push(newOrder);
      }

      res.status(200).json({
        success: true,
        message: "Flipkart orders synced successfully",
        ordersCount: savedOrders.length,
        savedOrders,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },
};
