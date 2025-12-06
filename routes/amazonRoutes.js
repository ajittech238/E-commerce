import express from "express";
import { amazonController } from "../controller/amazonController.js";
import { isAuthenticated } from ".././middleware/authMiddleware.js";

const router = express.Router();

router.get("/products", isAuthenticated, amazonController.getAmazonProducts);

router.post(
  "/sync-inventory/:warehouseProductId",
  isAuthenticated,
  amazonController.syncProductInventory
);

router.get(
  "/sync-orders",
  isAuthenticated,
  amazonController.fetchAmazonOrders
);

export  {router as amazonRouter};
