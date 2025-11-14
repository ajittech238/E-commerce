import { Router } from "express";
import { addToWishlist, getWishlist, recentFav, removeToWishlist } from "../controller/wishlistController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateWishlist, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/", isAuthenticated, checkPermission('wishlist', 'read'), getWishlist)
router.get("/recent-fav", isAuthenticated, checkPermission('wishlist', 'read'), recentFav)
router.post("/add", isAuthenticated, checkPermission('wishlist', 'create'), checkEmptyBody, validateWishlist, handleValidationErrors, addToWishlist)
router.post("/remove", isAuthenticated, checkPermission('wishlist', 'delete'), checkEmptyBody, validateWishlist, handleValidationErrors, removeToWishlist)

export {router as wishistRouter}