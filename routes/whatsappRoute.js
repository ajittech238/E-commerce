import { Router } from "express";
import { getConnectWhatsapp } from "../controller/whatsappController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.post("/message", isAuthenticated, checkPermission('whatsapp', 'create'), checkEmptyBody, handleValidationErrors, getConnectWhatsapp)

export {router as whatsappRouter }