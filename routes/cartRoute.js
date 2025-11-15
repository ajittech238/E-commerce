    import { Router } from "express";
    import { addToCart, clearCart, getToCart, removeToCart, updateCartItemQuantity } from "../controller/cartController.js";
    import { isAuthenticated } from "../middleware/authMiddleware.js";
    import { checkPermission } from "../middleware/permissionMiddleware.js";
    import { validateCart, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

    const router = Router();

    router.post("/add", isAuthenticated, checkPermission('cart', 'create'), checkEmptyBody, validateCart, handleValidationErrors, addToCart)
    router.get("/get", isAuthenticated, checkPermission('cart', 'read'), getToCart)
    router.post("/clear", isAuthenticated, checkPermission('cart', 'delete'), clearCart)
    router.patch("/remove", isAuthenticated, checkPermission('cart', 'update'), checkEmptyBody, handleValidationErrors, removeToCart)
    router.put("/update", isAuthenticated, checkPermission('cart', 'update'), checkEmptyBody, validateCart, handleValidationErrors, updateCartItemQuantity)

    export {router as cartRouter}