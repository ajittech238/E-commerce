import axios from "axios";
import { warehouseProduct } from "../model/warehouseProductModel.js";
import { warehouseOrder } from "../model/warehouseOrderModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";

// ENV VALIDATION
const validateEnv = (keys = []) => {
  keys.forEach((key) => {
    if (!process.env[key]) {
      throw new ErrorHandler(`Missing environment variable: ${key}`, 500);
    }
  });
};

// SHOPIFY CLIENT
const createShopifyClient = () => {
  validateEnv([
    "SHOPIFY_STORE_URL",
    "SHOPIFY_ACCESS_TOKEN",
  ]);

  return axios.create({
    baseURL: `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2025-01`,
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  });
};

// SHOPIFY CONTROLLER
export const shopifyController = {

  // GET ALL SHOPIFY PRODUCTS
  getShopifyProducts: async (req, res, next) => {
    try {
      const client = createShopifyClient();
      const response = await client.get("/products.json");

      return res.status(200).json({
        success: true,
        count: response.data.products.length,
        products: response.data.products,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // CREATE PRODUCT ON SHOPIFY FROM WAREHOUSE
  createShopifyProduct: async (req, res, next) => {
    try {
      const { warehouseProductId } = req.params;
      if (!warehouseProductId) return next(new ErrorHandler("warehouseProductId is required", 400));

      const product = await warehouseProduct.findById(warehouseProductId)
        .populate("productId", "name price images");

      if (!product) return next(new ErrorHandler("Warehouse product not found", 404));

      const client = createShopifyClient();

      const payload = {
        product: {
          title: product.productId.name,
          body_html: `<strong>${product.productId.name}</strong>`,
          vendor: "Warehouse",
          variants: [
            {
              sku: product.sku,
              price: product.productId.price,
              inventory_quantity: product.quantity,
              inventory_management: "shopify",
            },
          ],
          images: product.productId.images.map(img => ({ src: img })),
        },
      };

      const response = await client.post("/products.json", payload);

      res.status(200).json({
        success: true,
        message: "Product created on Shopify successfully",
        shopifyProduct: response.data.product,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // UPDATE SHOPIFY INVENTORY
  updateInventory: async (req, res, next) => {
    try {
      const { variantId, quantity } = req.body;
      if (!variantId || quantity == null) return next(new ErrorHandler("variantId and quantity are required", 400));

      const client = createShopifyClient();

      const payload = {
        variant: {
          id: variantId,
          inventory_quantity: quantity,
        },
      };

      const response = await client.put(`/variants/${variantId}.json`, payload);

      res.status(200).json({
        success: true,
        message: "Inventory updated successfully",
        variant: response.data.variant,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // FETCH SHOPIFY ORDERS AND SAVE TO WAREHOUSE
  fetchShopifyOrders: async (req, res, next) => {
    try {
      const { warehouseId } = req.body;
      if (!warehouseId) return next(new ErrorHandler("warehouseId is required", 400));

      const client = createShopifyClient();

      const response = await client.get("/orders.json?status=any");
      const orders = response.data.orders;

      if (!orders.length) return next(new ErrorHandler("No Shopify orders found", 404));

      const savedOrders = [];

      for (const o of orders) {
        const newOrder = await warehouseOrder.create({
          sellerId: req.user?._id,
          warehouseId,
          items: o.line_items.map(li => ({
            warehouseProduct: li.sku, // yaha mapping SKU to warehouseProductId chahiye ho sakta hai
            quantity: li.quantity,
            unitPrice: li.price,
          })),
          totalAmount: o.total_price || 0,
          paymentStatus: o.financial_status || "pending",
          status: o.fulfillment_status || "pending",
          shippingAddress: o.shipping_address || {},
        });

        savedOrders.push(newOrder);
      }

      res.status(200).json({
        success: true,
        message: "Shopify orders synced into warehouse successfully",
        orderCount: savedOrders.length,
        savedOrders,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // BULK CREATE ALL WAREHOUSE PRODUCTS TO SHOPIFY
  bulkCreateProducts: async (req, res, next) => {
    try {
      const products = await warehouseProduct.find()
        .populate("productId", "name price images");

      const client = createShopifyClient();
      const createdProducts = [];

      for (const product of products) {
        const payload = {
          product: {
            title: product.productId.name,
            body_html: `<strong>${product.productId.name}</strong>`,
            vendor: "Warehouse",
            variants: [
              {
                sku: product.sku,
                price: product.productId.price,
                inventory_quantity: product.quantity,
                inventory_management: "shopify",
              },
            ],
            images: product.productId.images.map(img => ({ src: img })),
          },
        };

        const response = await client.post("/products.json", payload);
        createdProducts.push(response.data.product);
      }

      res.status(200).json({
        success: true,
        message: `${createdProducts.length} products created on Shopify`,
        products: createdProducts,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },
};
