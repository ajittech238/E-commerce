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

// EBAY API CLIENT
const createEbayClient = () => {
  validateEnv([
    "EBAY_ACCESS_TOKEN",
    "EBAY_ENV",        // production OR sandbox
  ]);

  const BASE_URL =
    process.env.EBAY_ENV === "production"
      ? "https://api.ebay.com/sell"
      : "https://api.sandbox.ebay.com/sell";

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${process.env.EBAY_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
};




// EBAY CONTROLLER
export const ebayController = {

  // GET ACTIVE EBAY LISTINGS
  getEbayProducts: async (req, res, next) => {
    try {
      const client = createEbayClient();

      const response = await client.get("/inventory/v1/inventory_item");

      res.status(200).json({
        success: true,
        products: response.data.inventoryItems || [],
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // CREATE PRODUCT ON EBAY FROM WAREHOUSE
  createEbayProduct: async (req, res, next) => {
    try {
      const { warehouseProductId } = req.params;

      const wp = await warehouseProduct.findById(warehouseProductId)
        .populate("productId", "name price images itemTag shippingTag");

      if (!wp) return next(new ErrorHandler("Warehouse product not found", 404));

      const client = createEbayClient();

      const payload = {
        sku: wp.sku,
        product: {
          title: wp.productId.name,
          description: `${wp.productId.name} - Auto Synced from Warehouse`,
          price: wp.productId.price,
          imageUrls: wp.productId.images,
        },
        availability: {
          shipToLocationAvailability: {
            quantity: wp.quantity,
          },
        },
      };

      const response = await client.put(
        `/inventory/v1/inventory_item/${wp.sku}`,
        payload
      );

      res.status(200).json({
        success: true,
        message: "Product created on eBay successfully",
        ebayProduct: response.data,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // UPDATE INVENTORY
  updateInventory: async (req, res, next) => {
    try {
      const { sku, quantity } = req.body;

      if (!sku || quantity == null)
        return next(new ErrorHandler("sku and quantity are required", 400));

      const client = createEbayClient();

      const payload = {
        shipToLocationAvailability: {
          quantity,
        },
      };

      const response = await client.post(
        `/inventory/v1/inventory_item/${sku}/availabilities`,
        payload
      );

      res.status(200).json({
        success: true,
        message: "Inventory updated on eBay successfully",
        result: response.data,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // FETCH EBAY ORDERS TO WAREHOUSE
  fetchEbayOrders: async (req, res, next) => {
    try {
      const { warehouseId } = req.body;
      if (!warehouseId) return next(new ErrorHandler("warehouseId required", 400));

      const client = createEbayClient();

      const response = await client.get("/fulfillment/v1/order");

      const orders = response.data.orders || [];
      const savedOrders = [];

      for (const o of orders) {
        const order = await warehouseOrder.create({
          sellerId: req.user?._id,
          warehouseId,
          items: o.lineItems.map(li => ({
            warehouseProduct: li.sku,      // you can map SKU → warehouseProductId
            quantity: li.quantity,
            unitPrice: li.lineItemCost.value,
          })),
          totalAmount: o.totalFeeBasisAmount?.value || 0,
          paymentStatus: o.orderPaymentStatus,
          status: o.orderFulfillmentStatus,
          shippingAddress: o.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo,
        });

        savedOrders.push(order);
      }

      res.status(200).json({
        success: true,
        message: "eBay orders synced to warehouse",
        count: savedOrders.length,
        savedOrders,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

  // BULK UPLOAD → Warehouse → eBay
  bulkCreateProducts: async (req, res, next) => {
    try {
      const products = await warehouseProduct.find()
        .populate("productId", "name price images itemTag");

      const client = createEbayClient();
      const created = [];

      for (const wp of products) {
        const payload = {
          sku: wp.sku,
          product: {
            title: wp.productId.name,
            description: wp.productId.name,
            price: wp.productId.price,
            imageUrls: wp.productId.images,
          },
          availability: {
            shipToLocationAvailability: {
              quantity: wp.quantity,
            },
          },
        };

        const r = await client.put(
          `/inventory/v1/inventory_item/${wp.sku}`,
          payload
        );

        created.push(r.data);
      }

      res.status(200).json({
        success: true,
        message: `${created.length} products uploaded to eBay`,
        created,
      });

    } catch (error) {
      next(new ErrorHandler(error.response?.data || error.message, 500));
    }
  },

};

