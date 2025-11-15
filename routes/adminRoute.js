import { Router } from "express";
import { banuser, deleteUser, getAllUsers, roleChange } from "../controller/adminController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/user", isAuthenticated, checkPermission('users', 'list'), getAllUsers)
router.patch("/ban/:id", isAuthenticated, checkPermission('users', 'update'), checkEmptyBody, handleValidationErrors, banuser)
router.delete("/delete/:id", isAuthenticated, checkPermission('users', 'delete'), deleteUser)
router.patch("/role/:id", isAuthenticated, checkPermission('users', 'update'), checkEmptyBody, handleValidationErrors, roleChange)

export {router as adminRouter}