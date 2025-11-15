import { Router } from "express";
import { clearNotifications, deleteNotification, getAllnotification, sendNotificationToAll, getOneNotification, updateNotification } from "../controller/notificationController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateNotification, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/get", isAuthenticated, checkPermission('notifications', 'list'), getAllnotification)
router.get("/get/:id", isAuthenticated, checkPermission('notifications', 'read'), getOneNotification)
router.post("/create", isAuthenticated, checkPermission('notifications', 'create'), checkEmptyBody, validateNotification, handleValidationErrors, sendNotificationToAll)
router.put("/update/:id", isAuthenticated, checkPermission('notifications', 'update'), checkEmptyBody, handleValidationErrors, updateNotification)
router.delete("/delete/:id", isAuthenticated, checkPermission('notifications', 'delete'), deleteNotification)
router.delete("/clear", isAuthenticated, checkPermission('notifications', 'delete'), clearNotifications)

export {router as notificationRouter}