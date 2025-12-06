import axios from "axios";
import { warehouseProduct } from "../model/warehouseProductModel.js";
import { warehouseOrder } from "../model/warehouseOrderModel.js";
import { productDetails } from "../model/productModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";

// ========================
// ENV VALIDATOR (inside controller)
// ========================
const validateEnv = (keys = []) => {
  keys.forEach((key) => {
    if (!process.env[key]) {
      throw new ErrorHandler(`Missing environment variable: ${key}`, 500);
    }
  });
};

// ========================
// CREATE WOOCOMMERCE CLIENT (inside controller)
// ========================
const createWooClient = () => {
  validateEnv([
    "WOO_BASE_URL",
    "WOO_CONSUMER_KEY",
    "WOO_CONSUMER_SECRET",
  ]);

  return axios.create({
    baseURL: `${process.env.WOO_BASE_URL}/wp-json/wc/v3`,
    auth: {
      username: process.env.WOO_CONSUMER_KEY,
      password: process.env.WOO_CONSUMER_SECRET,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
};


// ========================
// MAIN CONTROLLER
// ========================
export const wooCommerceController = {

  // 1️⃣ CREATE PRODUCT ON WOOCOMMERCE
  createProduct: async (req, res, next) => {
    try {
      const { warehouseProductId } = req.params;

      if (!warehouseProductId)
        return next(new ErrorHandler("warehouseProductId is required", 400));

      const wp = await warehouseProduct.findById(warehouseProductId)
        .populate("productId");

      if (!wp) return next(new ErrorHandler("Warehouse product not found", 404));

      const product = wp.productId;

      const client = createWooClient();

      const payload = {
        name: product.name,
        type: "simple",
        regular_price: product.price.toString(),
        manage_stock: true,
        stock_quantity: wp.quantity,
        description: product.description || "",
        images: (product.images || []).map((img) => ({ src: img })),
      };

      const response = await client.post("/products", payload);

      res.status(200).json({
        success: true,
        message: "Product Created on WooCommerce",
        data: response.data,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },


  // 2️⃣ UPDATE INVENTORY
  updateInventory: async (req, res, next) => {
    try {
      const { wooProductId, quantity } = req.body;

      if (!wooProductId)
        return next(new ErrorHandler("wooProductId is required", 400));

      const client = createWooClient();

      const response = await client.put(`/products/${wooProductId}`, {
        stock_quantity: quantity,
      });

      res.status(200).json({
        success: true,
        message: "WooCommerce Inventory Updated",
        data: response.data,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },


  // 3️⃣ GET ALL WOOCOMMERCE PRODUCTS
  getProducts: async (req, res, next) => {
    try {
      const client = createWooClient();
      const response = await client.get("/products");

      res.status(200).json({
        success: true,
        products: response.data,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },


  // 4️⃣ FETCH ORDERS + SAVE TO WAREHOUSE
  fetchOrders: async (req, res, next) => {
    try {
      const { warehouseId } = req.body;

      if (!warehouseId)
        return next(new ErrorHandler("warehouseId is required", 400));

      const client = createWooClient();
      const response = await client.get("/orders");

      if (!response.data.length)
        return next(new ErrorHandler("No WooCommerce Orders Found", 404));

      const savedOrders = [];

      for (const o of response.data) {
        const newOrder = await warehouseOrder.create({
          sellerId: req.user?._id,
          warehouseId,
          items: [],
          totalAmount: o.total || 0,
          paymentStatus: o.status === "processing" ? "paid" : "pending",
          status: "pending",
          shippingAddress: o.billing || {},
        });

        savedOrders.push(newOrder);
      }

      res.status(200).json({
        success: true,
        message: "WooCommerce Orders Synced",
        count: savedOrders.length,
        savedOrders,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

};
