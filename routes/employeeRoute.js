import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { validateEmployee, handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";
import { addEmployee, disableEmployee, getEmployee, getOneEmployee, updateEmployee } from "../controller/employeeController.js";
import { addSalary, mySalaryHistory, salaryHistory } from "../controller/salaryController.js";
import { applyingLeave, approveLeaves, checkLeave, checkLeaves, dashboardOverview } from "../controller/leaveController.js";

const router = Router()

router.post("/add", isAuthenticated, checkPermission('employees', 'create'), checkEmptyBody, validateEmployee, handleValidationErrors, addEmployee)
router.get("/get", isAuthenticated, checkPermission('employees', 'list'), getEmployee)
router.get("/getone/:id", isAuthenticated, checkPermission('employees', 'read'), getOneEmployee)
router.patch("/update/:id", isAuthenticated, checkPermission('employees', 'update'), checkEmptyBody, handleValidationErrors, updateEmployee)
router.patch("/disable/:id", isAuthenticated, checkPermission('employees', 'update'), disableEmployee)
router.post("/addSalary", isAuthenticated, checkPermission('employees', 'update'), checkEmptyBody, handleValidationErrors, addSalary)
router.get("/getSalary/:id", isAuthenticated, checkPermission('employees', 'read'), salaryHistory)
router.get("/getSalary", isAuthenticated, mySalaryHistory)
router.post("/leave", isAuthenticated, checkEmptyBody, handleValidationErrors, applyingLeave)
router.get("/checkleave", isAuthenticated, checkLeave)
router.get("/checkleaves", isAuthenticated, checkPermission('employees', 'list'), checkLeaves)
router.patch("/approveleaves", isAuthenticated, checkPermission('employees', 'update'), checkEmptyBody, handleValidationErrors, approveLeaves)
router.get("/dashboard/overview", isAuthenticated, checkPermission('employees', 'list'), dashboardOverview)

export {router as employeeRouter}