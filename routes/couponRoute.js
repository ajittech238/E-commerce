import { Router } from "express";
import { applyCoupon, createCoupon, deleteCoupon, editCoupon, getCoupon, removeCoupon } from "../controller/couponController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateCoupon, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/get", getCoupon)
router.post("/create", isAuthenticated, checkPermission('coupons', 'create'), checkEmptyBody, validateCoupon, handleValidationErrors, createCoupon)
router.patch("/edit/:id", isAuthenticated, checkPermission('coupons', 'update'), checkEmptyBody, handleValidationErrors, editCoupon)
router.delete("/delete/:id", isAuthenticated, checkPermission('coupons', 'delete'), deleteCoupon)
router.post("/applyCoupon", isAuthenticated, checkPermission('coupons', 'read'), checkEmptyBody, handleValidationErrors, applyCoupon)
router.post("/removeCoupon", isAuthenticated, checkPermission('coupons', 'read'), checkEmptyBody, handleValidationErrors, removeCoupon)

export {router as couponRouter}