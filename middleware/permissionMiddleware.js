import { user } from '../model/userModel.js';
import Role from '../model/roleModel.js';
import Permission from '../model/permissionModel.js';

export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const userData = await user.findById(userId).populate({
        path: 'roleId',
        populate: {
          path: 'permissions'
        }
      });

      if (!userData) {
        return res.status(403).json({
          success: false,
          message: 'User not found'
        });
      }

      // If user has no role assigned, check if they're admin by old role field
      if (!userData.roleId) {
        if (userData.role === 'admin') {
          return next(); // Allow admin access
        }
        return res.status(403).json({
          success: false,
          message: 'No role assigned. Please contact administrator.'
        });
      }

      const hasPermission = userData.roleId.permissions.some(permission => 
        permission.resource === resource && permission.actions.includes(action)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${action} on ${resource}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};
