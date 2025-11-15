import { Router } from "express";
import { forgetPassword, getStates, getUser, googleLogin, googleurl, resetPassword, updatePassword, updateProfile, userLogin, userLogout, userProfile, userRegister } from "../controller/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateUser, validateLogin, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";
import dotenv from "dotenv";
import { getProductByCategory } from "../controller/productController.js";
import { client } from "../utils/googletoken.js";
dotenv.config();

const router = Router()

router.post("/register", checkEmptyBody, validateUser, handleValidationErrors, userRegister)
router.post("/login", checkEmptyBody, validateLogin, handleValidationErrors, userLogin)
router.get("/google", googleurl)
router.patch("/updatePassword", isAuthenticated, checkEmptyBody, handleValidationErrors, updatePassword)
router.get("/google/callback", googleLogin)
router.get("/me", isAuthenticated, getUser)
router.get("/logout", userLogout)
router.post("/forget", checkEmptyBody, handleValidationErrors, forgetPassword)
router.get("/profile", isAuthenticated, userProfile)
router.put("/update", isAuthenticated, checkPermission('users', 'update'), checkEmptyBody, handleValidationErrors, updateProfile)
router.put("/reset/:token", checkEmptyBody, handleValidationErrors, resetPassword)
router.get("/user-states", isAuthenticated, getStates)

export {router as userRouter}