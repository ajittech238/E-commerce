import fs from 'fs';
import path from 'path';

const updates = [
  // Cart Routes
  {
    file: 'cartRoute.js',
    resource: 'cart',
    updates: [
      { pattern: /router\.post\("\/add"/, replacement: 'router.post("/add", isAuthenticated, checkPermission("cart", "create"),' },
      { pattern: /router\.get\("\/get"/, replacement: 'router.get("/get", isAuthenticated, checkPermission("cart", "read"),' },
      { pattern: /router\.put\("\/update"/, replacement: 'router.put("/update", isAuthenticated, checkPermission("cart", "update"),' },
      { pattern: /router\.delete\("\/delete"/, replacement: 'router.delete("/delete", isAuthenticated, checkPermission("cart", "delete"),' }
    ]
  },
  // Category Routes  
  {
    file: 'categoryRoute.js',
    resource: 'categories',
    updates: [
      { pattern: /router\.post\("\/add"/, replacement: 'router.post("/add", isAuthenticated, checkPermission("categories", "create"),' },
      { pattern: /router\.put\("\/update"/, replacement: 'router.put("/update", isAuthenticated, checkPermission("categories", "update"),' },
      { pattern: /router\.delete\("\/delete"/, replacement: 'router.delete("/delete", isAuthenticated, checkPermission("categories", "delete"),' }
    ]
  },
  // Coupon Routes
  {
    file: 'couponRoute.js', 
    resource: 'coupons',
    updates: [
      { pattern: /router\.post\("\/create"/, replacement: 'router.post("/create", isAuthenticated, checkPermission("coupons", "create"),' },
      { pattern: /router\.get\("\/get"/, replacement: 'router.get("/get", isAuthenticated, checkPermission("coupons", "read"),' },
      { pattern: /router\.put\("\/update"/, replacement: 'router.put("/update", isAuthenticated, checkPermission("coupons", "update"),' },
      { pattern: /router\.delete\("\/delete"/, replacement: 'router.delete("/delete", isAuthenticated, checkPermission("coupons", "delete"),' }
    ]
  }
];

const routesDir = '/Users/rampareek/Desktop/company/ecomarce/routes';

updates.forEach(({ file, resource }) => {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import
    if (!content.includes('checkPermission')) {
      const importMatch = content.match(/import.*authMiddleware.*\n/);
      if (importMatch) {
        content = content.replace(importMatch[0], 
          importMatch[0] + `import { checkPermission } from "../middleware/permissionMiddleware.js";\n`);
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
