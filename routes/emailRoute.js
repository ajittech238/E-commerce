import { Router } from "express";
import { sendEmailToAllUsers, sendEmailTouser } from "../controller/emailController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/sendAll", isAuthenticated, checkPermission('emails', 'create'), checkEmptyBody, handleValidationErrors, sendEmailToAllUsers)
router.post("/send/:id", isAuthenticated, checkPermission('emails', 'create'), checkEmptyBody, handleValidationErrors, sendEmailTouser)

export {router as emailRouter}