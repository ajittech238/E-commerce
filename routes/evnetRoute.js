import { Router } from "express";
import { activeEvent, createEvent, getEvents, stopAllevent, stopOneEvent, updateEvent } from "../controller/eventController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/getEvents", getEvents)
router.post("/create", isAuthenticated, checkPermission('events', 'create'), checkEmptyBody, handleValidationErrors, createEvent)
router.patch("/update/:id", isAuthenticated, checkPermission('events', 'update'), checkEmptyBody, handleValidationErrors, updateEvent)
router.post("/stopall", isAuthenticated, checkPermission('events', 'update'), stopAllevent)
router.post("/stop/:id", isAuthenticated, checkPermission('events', 'update'), stopOneEvent)
router.post("/active/:id", isAuthenticated, checkPermission('events', 'update'), activeEvent)

export {router as eventRouter}