import { Router } from "express";
import { isAuthenticated, isShopVerified } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateShop, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";
import { createshop, disableShop, getAllShop, getMyShop, getOneShop, getShopProduct, myshopProduct, updateshopDetails } from "../controller/shopCotroller.js";

const router = Router()

router.get("/myshop", isAuthenticated, checkPermission('shops', 'read'), getMyShop)
router.get("/myshopProduct", isAuthenticated, checkPermission('shops', 'read'), myshopProduct)
router.get("/allshop", getAllShop)
router.get("/Oneshop/:id", isAuthenticated, checkPermission('shops', 'read'), getOneShop)
router.get("/getShopProduct/:id", getShopProduct)
router.post("/create", isAuthenticated, checkPermission('shops', 'create'), checkEmptyBody, validateShop, handleValidationErrors, createshop)
router.patch("/updateShop/:id", isAuthenticated, checkPermission('shops', 'update'), checkEmptyBody, handleValidationErrors, updateshopDetails)
router.patch("/disable/:id", isAuthenticated, checkPermission('shops', 'update'), disableShop)

export {router as shopRouter}