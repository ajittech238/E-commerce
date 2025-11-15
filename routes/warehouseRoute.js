import { Router  } from "express";
import { addProductToWarehouse, addToWarehouseCart, clearWarehouseCart, createInvoiceforWarehouse, createrazorpayOrder, createWarehouse, createWarehouseOrder, deleteProductToWarehouse, editWarehouse, getAllWarehouse, getInvoiceOfWarehouse, getOneWarehouse, getProductOfWarehouse, getToWarehouseCart, getWarehouseOrder, removeFromWarehouseCart, updateProductToWarehouse, updateToWarehouseCart, updateWarehouseOrder, verifyPaymentOfWarehouse } from "../controller/warehouseController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router  = Router()

// Warehouse Management
router.post("/create", isAuthenticated, checkPermission('warehouse', 'create'), checkEmptyBody, handleValidationErrors, createWarehouse)
router.get("/getAll", isAuthenticated, checkPermission('warehouse', 'list'), getAllWarehouse)
router.get("/get/:No", isAuthenticated, checkPermission('warehouse', 'read'), getOneWarehouse)
router.patch("/edit/:No", isAuthenticated, checkPermission('warehouse', 'update'), checkEmptyBody, handleValidationErrors, editWarehouse)

// Warehouse Products
router.get("/:warehouseNo/products", isAuthenticated, checkPermission('warehouse', 'read'), getProductOfWarehouse)
router.post("/:warehouseNo/products", isAuthenticated, checkPermission('warehouse', 'create'), checkEmptyBody, handleValidationErrors, addProductToWarehouse)
router.patch("/:warehouseNo/products/:productId", isAuthenticated, checkPermission('warehouse', 'update'), checkEmptyBody, handleValidationErrors, updateProductToWarehouse)
router.delete("/:warehouseNo/products/:productId", isAuthenticated, checkPermission('warehouse', 'delete'), deleteProductToWarehouse)

// Warehouse Cart
router.get("/cart/get", isAuthenticated, checkPermission('warehouse', 'read'), getToWarehouseCart)
router.post("/cart/add", isAuthenticated, checkPermission('warehouse', 'create'), checkEmptyBody, handleValidationErrors, addToWarehouseCart)
router.put("/cart/update", isAuthenticated, checkPermission('warehouse', 'update'), checkEmptyBody, handleValidationErrors, updateToWarehouseCart)
router.patch("/cart/remove", isAuthenticated, checkPermission('warehouse', 'update'), checkEmptyBody, handleValidationErrors, removeFromWarehouseCart)
router.delete("/cart/clear", isAuthenticated, checkPermission('warehouse', 'delete'), clearWarehouseCart)

// Warehouse Orders
router.get("/orders/get", isAuthenticated, checkPermission('warehouse', 'read'), getWarehouseOrder)
router.post("/orders/create", isAuthenticated, checkPermission('warehouse', 'create'), checkEmptyBody, handleValidationErrors, createWarehouseOrder)
router.patch("/orders/update/:warehouseOrderId", isAuthenticated, checkPermission('warehouse', 'update'), checkEmptyBody, handleValidationErrors, updateWarehouseOrder)
router.post("/orders/razorpay", isAuthenticated, checkPermission('warehouse', 'create'), checkEmptyBody, handleValidationErrors, createrazorpayOrder)
router.post("/order/verifyPayment", isAuthenticated, checkPermission('warehouse', 'update'), checkEmptyBody, handleValidationErrors, verifyPaymentOfWarehouse)

// Warehouse Invoices
router.post("/:warehouseOrderId/invoice", isAuthenticated, checkPermission('warehouse', 'create'), checkEmptyBody, handleValidationErrors, createInvoiceforWarehouse)
router.get("/:warehouseOrderId/invoice", isAuthenticated, checkPermission('warehouse', 'read'), getInvoiceOfWarehouse)

export { router as warehouseRouter };