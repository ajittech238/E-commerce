import { Router  } from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";
import { approveRequest, getAlltheRequests, getOneRequest, paymentRefund, refundPaymentToWallet, rejectRequest, returnRequest, updateRequest } from "../controller/returnController.js";

const router = Router()

router.post("/returnRequest", isAuthenticated, checkPermission('returns', 'create'), checkEmptyBody, handleValidationErrors, returnRequest)
router.get("/allRequest", isAuthenticated, checkPermission('returns', 'list'), getAlltheRequests)
router.get("/request/:id", isAuthenticated, checkPermission('returns', 'read'), getOneRequest)
router.post("/approveRequest", isAuthenticated, checkPermission('returns', 'update'), checkEmptyBody, handleValidationErrors, approveRequest)
router.patch("/rejectRequest", isAuthenticated, checkPermission('returns', 'update'), checkEmptyBody, handleValidationErrors, rejectRequest)
router.put("/updateRequest/:id", isAuthenticated, checkPermission('returns', 'update'), checkEmptyBody, handleValidationErrors, updateRequest)
router.post("/refundToWallet", isAuthenticated, checkPermission('returns', 'update'), checkEmptyBody, handleValidationErrors, refundPaymentToWallet)
router.post("/refundToRazorpay", isAuthenticated, checkPermission('returns', 'update'), checkEmptyBody, handleValidationErrors, paymentRefund)

export {router as returnRouter}