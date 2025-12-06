import express from "express";
import { ebayController } from "../controller/ebayController.js";
import { isAuthenticated } from ".././middleware/authMiddleware.js";

const router = express.Router();

router.get("/products", isAuthenticated, ebayController.getEbayProducts);

router.post(
  "/sync-product/:warehouseProductId",
  isAuthenticated,
  ebayController.createEbayProduct
);

router.put(
  "/inventory",
  isAuthenticated,
  ebayController.updateInventory
);

router.post(
  "/orders",
  isAuthenticated,
  ebayController.fetchEbayOrders
);

router.post(
  "/bulk-upload",
  isAuthenticated,
  ebayController.bulkCreateProducts
);

export { router as ebayRouter };
