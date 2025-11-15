import { Router } from "express";
import { cancelOrder, createOrder, getAllorder, getMyorder, recentOrder, updateOrder } from "../controller/orderController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateOrder, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/my-order", isAuthenticated, checkPermission('orders', 'read'), getMyorder)
router.get("/all-order", isAuthenticated, checkPermission('orders', 'list'), getAllorder)
router.get("/recent-order", isAuthenticated, checkPermission('orders', 'read'), recentOrder)
router.post("/create", isAuthenticated, checkPermission('orders', 'create'), checkEmptyBody, validateOrder, handleValidationErrors, createOrder)
router.put("/cancel/:orderId", isAuthenticated, checkPermission('orders', 'update'), cancelOrder)
router.patch("/update/:orderId", isAuthenticated, checkPermission('orders', 'update'), checkEmptyBody, handleValidationErrors, updateOrder)

export {router as orderRouter}