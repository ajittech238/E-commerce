import { Router } from "express";
import { createReview, deleteReviews, getAllReviews, getReview, updateReview } from "../controller/reviewController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateReview, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.post("/create", isAuthenticated, checkPermission('reviews', 'create'), checkEmptyBody, validateReview, handleValidationErrors, createReview)
router.get("/Allreviews", isAuthenticated, checkPermission('reviews', 'list'), getAllReviews)
router.get("/getreviews/:id", isAuthenticated, checkPermission('reviews', 'read'), getReview)
router.patch("/update/:id", isAuthenticated, checkPermission('reviews', 'update'), checkEmptyBody, handleValidationErrors, updateReview)
router.delete("/delete/:id", isAuthenticated, checkPermission('reviews', 'delete'), deleteReviews)

export {router as reviewRouter}