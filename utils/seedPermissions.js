import Permission from '../model/permissionModel.js';
import Role from '../model/roleModel.js';

export const seedPermissions = async () => {
  try {
    // Complete list of ALL application resources
    const permissions = [
      // Core E-commerce
      { name: 'manage_users', resource: 'users', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_products', resource: 'products', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_orders', resource: 'orders', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_categories', resource: 'categories', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_coupons', resource: 'coupons', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_reviews', resource: 'reviews', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_cart', resource: 'cart', actions: ['create', 'read', 'update', 'delete'] },
      { name: 'manage_wishlist', resource: 'wishlist', actions: ['create', 'read', 'update', 'delete'] },
      
      // Business Operations
      { name: 'manage_employees', resource: 'employees', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_departments', resource: 'departments', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_warehouse', resource: 'warehouse', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_racks', resource: 'racks', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_invoices', resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_shops', resource: 'shops', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_transactions', resource: 'transactions', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_payments', resource: 'payments', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_returns', resource: 'returns', actions: ['create', 'read', 'update', 'delete', 'list'] },
      
      // Communication & Support
      { name: 'manage_notifications', resource: 'notifications', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_emails', resource: 'emails', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_whatsapp', resource: 'whatsapp', actions: ['create', 'read', 'update', 'delete'] },
      { name: 'manage_chatbot', resource: 'chatbot', actions: ['create', 'read', 'update', 'delete'] },
      { name: 'manage_qna', resource: 'qna', actions: ['create', 'read', 'update', 'delete', 'list'] },
      
      // Events & Rewards
      { name: 'manage_events', resource: 'events', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_rewards', resource: 'rewards', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_referrals', resource: 'referrals', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_scratch', resource: 'scratch', actions: ['create', 'read', 'update', 'delete'] },
      
      // System Management
      { name: 'manage_permissions', resource: 'permissions', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { name: 'manage_roles', resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'list'] },
      
      // Customer-specific permissions
      { name: 'customer_products', resource: 'products', actions: ['read', 'list'] },
      { name: 'customer_categories', resource: 'categories', actions: ['read', 'list'] },
      { name: 'customer_cart', resource: 'cart', actions: ['create', 'read', 'update', 'delete'] },
      { name: 'customer_orders', resource: 'orders', actions: ['create', 'read'] },
      { name: 'customer_reviews', resource: 'reviews', actions: ['create', 'read'] },
      { name: 'customer_wishlist', resource: 'wishlist', actions: ['create', 'read', 'update', 'delete'] },
      { name: 'customer_payments', resource: 'payments', actions: ['create', 'read'] },
      { name: 'customer_returns', resource: 'returns', actions: ['create', 'read'] },
      { name: 'customer_notifications', resource: 'notifications', actions: ['read', 'update', 'delete'] },
      { name: 'customer_chatbot', resource: 'chatbot', actions: ['create', 'read'] },
      { name: 'customer_scratch', resource: 'scratch', actions: ['read', 'update'] },
      { name: 'customer_referrals', resource: 'referrals', actions: ['read'] },
      { name: 'customer_events', resource: 'events', actions: ['read'] }
    ];

    for (const perm of permissions) {
      await Permission.findOneAndUpdate(
        { name: perm.name },
        perm,
        { upsert: true, new: true }
      );
    }

    const allPermissions = await Permission.find();
    const adminPermissions = allPermissions.filter(p => p.name.startsWith('manage_')).map(p => p._id);
    const buyerPermissions = allPermissions.filter(p => p.name.startsWith('customer_')).map(p => p._id);

    // Create roles
    await Role.findOneAndUpdate(
      { name: 'admin' },
      { 
        name: 'admin', 
        permissions: adminPermissions,
        description: 'Full system access'
      },
      { upsert: true, new: true }
    );

    await Role.findOneAndUpdate(
      { name: 'buyer' },
      { 
        name: 'buyer', 
        permissions: buyerPermissions,
        description: 'Customer access'
      },
      { upsert: true, new: true }
    );

    console.log('✅ All permissions and roles seeded successfully');
    console.log(`📊 Created ${permissions.length} permissions and 2 roles`);
    console.log(`🔐 Admin permissions: ${adminPermissions.length}`);
    console.log(`🛒 Customer permissions: ${buyerPermissions.length}`);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
  }
};
