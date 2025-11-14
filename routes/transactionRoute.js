import { Router  } from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateTransaction, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";
import { addMoney, applyWalletMoney, getBalance, unapplyWalletMoney} from "../controller/transtionController.js";

const router = Router()

router.get("/checkBalance", isAuthenticated, checkPermission('transactions', 'read'), getBalance)
router.post("/addMoney", isAuthenticated, checkPermission('transactions', 'create'), checkEmptyBody, validateTransaction, handleValidationErrors, addMoney)
router.post("/applyWallet", isAuthenticated, checkPermission('transactions', 'update'), checkEmptyBody, handleValidationErrors, applyWalletMoney)
router.post("/unapplyWallet", isAuthenticated, checkPermission('transactions', 'update'), checkEmptyBody, handleValidationErrors, unapplyWalletMoney)

export {router as transactionRouter}