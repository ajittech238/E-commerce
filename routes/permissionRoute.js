import express from 'express';
import { 
  createPermission, 
  getAllPermissions, 
  createRole, 
  getAllRoles, 
  assignRole, 
  updateRolePermissions,
  getUserPermissions 
} from '../controller/permissionController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { handleValidationErrors, checkEmptyBody } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Permission routes (admin only)
router.post('/permissions', isAuthenticated, checkPermission('permissions', 'create'), checkEmptyBody, handleValidationErrors, createPermission);
router.get('/permissions', isAuthenticated, checkPermission('permissions', 'read'), getAllPermissions);

// Role routes (admin only)
router.post('/roles', isAuthenticated, checkPermission('roles', 'create'), checkEmptyBody, handleValidationErrors, createRole);
router.get('/roles', isAuthenticated, checkPermission('roles', 'read'), getAllRoles);
router.put('/roles/:roleId/permissions', isAuthenticated, checkPermission('roles', 'update'), checkEmptyBody, handleValidationErrors, updateRolePermissions);

// User role assignment (admin only)
router.post('/assign-role', isAuthenticated, checkPermission('users', 'update'), checkEmptyBody, handleValidationErrors, assignRole);
router.get('/users/:userId/permissions', isAuthenticated, checkPermission('users', 'read'), getUserPermissions);

export default router;
