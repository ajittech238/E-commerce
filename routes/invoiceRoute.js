import { Router } from "express";
import { createInvoice, downloadInvoice, getInvoice } from "../controller/invoiceController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.post("/get", isAuthenticated, checkPermission('invoices', 'read'), checkEmptyBody, handleValidationErrors, getInvoice)
router.post("/create", isAuthenticated, checkPermission('invoices', 'create'), checkEmptyBody, handleValidationErrors, createInvoice)
router.get("/download/:id", isAuthenticated, checkPermission('invoices', 'read'), downloadInvoice)

export {router as invoiceRouter}