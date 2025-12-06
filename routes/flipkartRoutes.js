import express from "express";
import { flipkartController } from "../controller/flipkartController.js";
import { isAuthenticated } from ".././middleware/authMiddleware.js";

const router = express.Router();

// GET Products
router.get("/products", isAuthenticated, flipkartController.getFlipkartProducts);

// Sync Inventory to Flipkart
router.post(
  "/sync-inventory/:warehouseProductId",
  isAuthenticated,
  flipkartController.syncProductInventory
);

// Fetch Orders
router.post(
  "/orders",
  isAuthenticated,
  flipkartController.fetchFlipkartOrders
);

export  {router as  flipkartRouter};
