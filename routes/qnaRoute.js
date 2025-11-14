import { Router  } from "express";
import { createQNA, deleteQNA, getOneQNA, getQNA, updateQNA } from "../controller/qnaController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/get", getQNA)
router.get("/get/:id", getOneQNA)
router.post("/create", isAuthenticated, checkPermission('qna', 'create'), checkEmptyBody, handleValidationErrors, createQNA)
router.put("/update/:id", isAuthenticated, checkPermission('qna', 'update'), checkEmptyBody, handleValidationErrors, updateQNA)
router.delete("/delete/:id", isAuthenticated, checkPermission('qna', 'delete'), deleteQNA)

export {router as qnaRouter }
