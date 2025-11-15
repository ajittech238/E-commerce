import { Router } from "express";
import { addProductToRack, addRackRoW, DeleteProductToRack, deleteRack, getProductToRack, getRack, updateProductToRack, updateRackRoW } from "../controller/rackController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

// Rack management
router.get("/", isAuthenticated, checkPermission('racks', 'list'), getRack)
router.post("/", isAuthenticated, checkPermission('racks', 'create'), checkEmptyBody, handleValidationErrors, addRackRoW)
router.patch("/:id", isAuthenticated, checkPermission('racks', 'update'), checkEmptyBody, handleValidationErrors, updateRackRoW)
router.delete("/:id", isAuthenticated, checkPermission('racks', 'delete'), deleteRack)

// Rack product management
router.post("/addToRack", isAuthenticated, checkPermission('racks', 'create'), checkEmptyBody, handleValidationErrors, addProductToRack)
router.get("/getByRack/:id", isAuthenticated, checkPermission('racks', 'read'), getProductToRack)
router.patch("/updateToRack/:id", isAuthenticated, checkPermission('racks', 'update'), checkEmptyBody, handleValidationErrors, updateProductToRack)
router.delete("/deleteFromRack/:rackId/:warehouseProductId", isAuthenticated, checkPermission('racks', 'delete'), DeleteProductToRack)

export {router as rackRouter}