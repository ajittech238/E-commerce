import { Router } from "express";
import { addProduct, deleteProduct, filterProduct, getProduct, getProductByCategory, updateProduct } from "../controller/productController.js";
import { isAuthenticated, isAuthorized, isShopVerified } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateProduct, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/get", getProduct)
router.get("/get/:categoryId", getProductByCategory)
router.get("/filter", filterProduct)
router.post("/add", isAuthenticated, checkPermission('products', 'create'), upload.array('images', 10), checkEmptyBody, validateProduct, handleValidationErrors, isShopVerified, addProduct)
router.put("/update/:id", isAuthenticated, checkPermission('products', 'update'), checkEmptyBody, validateProduct, handleValidationErrors, updateProduct)
router.patch("/updateOne/:id", isAuthenticated, checkPermission('products', 'update'), checkEmptyBody, handleValidationErrors, updateProduct)
router.delete("/delete/:id", isAuthenticated, checkPermission('products', 'delete'), deleteProduct)

export {router as productRouter}