import { Router } from "express";
import { addDepartment, deleteDepartment, getDepartment, updateDepartment } from "../controller/departmentController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/", isAuthenticated, checkPermission('departments', 'list'), getDepartment)
router.post("/add", isAuthenticated, checkPermission('departments', 'create'), checkEmptyBody, handleValidationErrors, addDepartment)
router.patch("/update/:id", isAuthenticated, checkPermission('departments', 'update'), checkEmptyBody, handleValidationErrors, updateDepartment)
router.delete("/delete/:id", isAuthenticated, checkPermission('departments', 'delete'), deleteDepartment)

export {router as departmentRouter}