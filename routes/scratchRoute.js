import { Router } from "express";
import { myScratch, Scratchreward } from "../controller/scratchCardController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router();

router.get("/myscratch", isAuthenticated, checkPermission('scratch', 'read'), myScratch)
router.post("/:id", isAuthenticated, checkPermission('scratch', 'update'), checkEmptyBody, handleValidationErrors, Scratchreward)

export { router as scratchRouter}