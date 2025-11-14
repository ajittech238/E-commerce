import fs from 'fs';
import path from 'path';

const routesDir = '/Users/rampareek/Desktop/company/ecomarce/routes';
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'permissionRoute.js');

const permissionMap = {
  'userRoute.js': 'users',
  'orderRoute.js': 'orders', 
  'cartRoute.js': 'cart',
  'categoryRoute.js': 'categories',
  'couponRoute.js': 'coupons',
  'reviewRoute.js': 'reviews',
  'employeeRoute.js': 'employees',
  'warehouseRoute.js': 'warehouse',
  'invoiceRoute.js': 'invoices',
  'shopRoute.js': 'shops',
  'adminRoute.js': 'admin'
};

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not exists
  if (!content.includes('checkPermission')) {
    const importLine = "import { checkPermission } from '../middleware/permissionMiddleware.js';";
    const lines = content.split('\n');
    const lastImportIndex = lines.findLastIndex(line => line.startsWith('import'));
    lines.splice(lastImportIndex + 1, 0, importLine);
    content = lines.join('\n');
  }
  
  const resource = permissionMap[file] || file.replace('Route.js', '').replace('Routes.js', '');
  
  // Add permissions to routes
  content = content
    .replace(/router\.post\([^,]+,\s*isAuthenticated,/g, `router.post($&`.replace('isAuthenticated,', `isAuthenticated, checkPermission('${resource}', 'create'),`))
    .replace(/router\.put\([^,]+,\s*isAuthenticated,/g, `router.put($&`.replace('isAuthenticated,', `isAuthenticated, checkPermission('${resource}', 'update'),`))
    .replace(/router\.patch\([^,]+,\s*isAuthenticated,/g, `router.patch($&`.replace('isAuthenticated,', `isAuthenticated, checkPermission('${resource}', 'update'),`))
    .replace(/router\.delete\([^,]+,\s*isAuthenticated,/g, `router.delete($&`.replace('isAuthenticated,', `isAuthenticated, checkPermission('${resource}', 'delete'),`));
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
