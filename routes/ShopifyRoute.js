import express from "express";
import { shopifyController } from "../controller/shopifyController.js";
import { isAuthenticated } from ".././middleware/authMiddleware.js";

const router = express.Router();

// Create single product from warehouse to Shopify
router.post(
  "/shopify/product/:warehouseProductId",
  isAuthenticated,
  shopifyController.createShopifyProduct
);

// Update inventory of Shopify product variant
router.put(
  "/shopify/inventory",
  isAuthenticated,
  shopifyController.updateInventory
);

// Get all Shopify products
router.get(
  "/shopify/products",
  isAuthenticated,
  shopifyController.getShopifyProducts
);

// Fetch Shopify orders and save to warehouse
router.post(
  "/shopify/orders/fetch",
  isAuthenticated,
  shopifyController.fetchShopifyOrders
);

// Bulk create all warehouse products to Shopify
router.post(
  "/shopify/products/bulk",
  isAuthenticated,
  shopifyController.bulkCreateProducts
);

export { router as shopifyRouter };
