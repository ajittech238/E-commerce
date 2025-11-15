import express from "express";
import { createRazorpayOrderAndVerify, verifyPaymentAndCreateOrder } from "../controller/razorpayController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/create-order", isAuthenticated, checkPermission('payments', 'create'), checkEmptyBody, handleValidationErrors, createRazorpayOrderAndVerify);
router.post("/verify-payment", isAuthenticated, checkPermission('payments', 'update'), checkEmptyBody, handleValidationErrors, verifyPaymentAndCreateOrder);

export {router as razorpayRouter}