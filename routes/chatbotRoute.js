import { Router } from "express";
import { ask2Gemini, askGemini, closechat, gethistory, gethistorybyId } from "../controller/chatbotController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateChatbot, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.post("/ask", isAuthenticated, checkPermission('chatbot', 'create'), checkEmptyBody, validateChatbot, handleValidationErrors, askGemini)
router.post("/ask2", isAuthenticated, checkPermission('chatbot', 'create'), checkEmptyBody, validateChatbot, handleValidationErrors, ask2Gemini)
router.patch("/close", isAuthenticated, checkPermission('chatbot', 'update'), checkEmptyBody, handleValidationErrors, closechat)
router.get("/history", isAuthenticated, checkPermission('chatbot', 'read'), gethistory)
router.get("/history/:id", isAuthenticated, checkPermission('chatbot', 'read'), gethistorybyId)

export {router as chatbotRouter}