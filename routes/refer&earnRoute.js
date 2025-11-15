import { Router } from "express";
import { allReferData, myReferData, OneUserReferData, referDashboardData } from "../controller/refer&earnController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = Router()

router.get("/myrefer", isAuthenticated, checkPermission('referrals', 'read'), myReferData)
router.get("/allrefer", isAuthenticated, checkPermission('referrals', 'list'), allReferData)
router.get("/userrefer/:id", isAuthenticated, checkPermission('referrals', 'read'), OneUserReferData)
router.get("/referDashboard", isAuthenticated, checkPermission('referrals', 'read'), referDashboardData)

export {router as referearnRouter}