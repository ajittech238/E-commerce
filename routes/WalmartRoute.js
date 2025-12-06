import express from "express";
import { walmartController } from "../controller/walmartController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL WALMART PRODUCTS
router.get(
  "/products",
  isAuthenticated,
  walmartController.getWalmartProducts
);

//  WALMART FROM WAREHOUSE product cretae
router.post(
  "/product/:warehouseProductId",
  isAuthenticated,
  walmartController.createWalmartProduct
);

// UPDATE INVENTORY
router.put(
  "/inventory",
  isAuthenticated,
  walmartController.updateInventory
);

// FETCH Walmart ORDERS AND SAVE TO WAREHOUSE
router.post(
  "/orders/fetch",
  isAuthenticated,
  walmartController.fetchWalmartOrders
);

// BULK CREATE ALL WAREHOUSE PRODUCTS TO WALMART
router.post(
  "/products/bulk-create",
  isAuthenticated,
  walmartController.bulkCreateProducts
);



export { router as walmartRouter };
