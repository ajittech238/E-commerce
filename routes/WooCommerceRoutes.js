import express from "express";
import { wooCommerceController } from "../controller/wooCommerceController.js";
import { isAuthenticated } from ".././middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/woocommerce/product/:warehouseProductId",
  isAuthenticated,
  wooCommerceController.createProduct
);

router.put(
  "/woocommerce/inventory",
  isAuthenticated,
  wooCommerceController.updateInventory
);

router.get(
  "/woocommerce/products",
  isAuthenticated,
  wooCommerceController.getProducts
);

router.post(
  "/woocommerce/orders/fetch",
  isAuthenticated,
  wooCommerceController.fetchOrders
);

export { router as wooCommerceRouter };
