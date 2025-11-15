import Permission from '../model/permissionModel.js';
import Role from '../model/roleModel.js';
import { user } from '../model/userModel.js';

// Create Permission
export const createPermission = async (req, res) => {
  try {
    const permission = await Permission.create(req.body);
    res.status(201).json({
      success: true,
      permission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Permissions
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.status(200).json({
      success: true,
      permissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create Role
export const createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json({
      success: true,
      role
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions');
    res.status(200).json({
      success: true,
      roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Assign Role to User
export const assignRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    const updatedUser = await user.findByIdAndUpdate(
      userId,
      { roleId },
      { new: true }
    ).populate('roleId');

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update Role Permissions
export const updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    const role = await Role.findByIdAndUpdate(
      roleId,
      { permissions },
      { new: true }
    ).populate('permissions');

    res.status(200).json({
      success: true,
      role
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get User Permissions
export const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userData = await user.findById(userId).populate({
      path: 'roleId',
      populate: {
        path: 'permissions'
      }
    });

    res.status(200).json({
      success: true,
      permissions: userData?.roleId?.permissions || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
