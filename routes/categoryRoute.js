import { Router } from "express";
import { addCategory, getAllCategory, removeCategory, updateCategory, getOneCategory } from "../controller/categoryController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateCategory, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/", getAllCategory)
router.get("/:id", getOneCategory)
router.post("/add", isAuthenticated, checkPermission('categories', 'create'), checkEmptyBody, validateCategory, handleValidationErrors, addCategory)
router.put("/update/:id", isAuthenticated, checkPermission('categories', 'update'), checkEmptyBody, validateCategory, handleValidationErrors, updateCategory)
router.delete("/:id", isAuthenticated, checkPermission('categories', 'delete'), removeCategory)

export {router as catogoryRouter}