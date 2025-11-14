import { body, validationResult } from 'express-validator';

// Generic validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorArray = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorArray,
      requiredFields: getRequiredFields(req.originalUrl, req.method)
    });
  }
  next();
};

// Get required fields based on actual route URL
const getRequiredFields = (url, method) => {
  const fieldMap = {
    // Auth routes
    'POST:/api/v1/auth/register': ['userName', 'email', 'password'],
    'POST:/api/v1/auth/login': ['email', 'password'],
    'POST:/api/v1/auth/forget': ['email'],
    'PUT:/api/v1/auth/reset': ['password'],
    
    // Product routes - Updated with model requirements
    'POST:/api/v1/product/add': ['name', 'price', 'category', 'quantity', 'itemTag'],
    'PUT:/api/v1/product/update': ['name', 'price', 'category', 'quantity'],
    
    // Category routes - Updated with model requirements
    'POST:/api/v1/category/add': ['name', 'type'],
    'PUT:/api/v1/category/update': ['name', 'type'],
    
    // Order routes - Updated with model requirements
    'POST:/api/v1/order/create': ['shippingAddress'],
    
    // Shop routes - Updated with model requirements
    'POST:/api/v1/shop/create': ['shopName', 'location', 'contactNumber'],
    'PATCH:/api/v1/shop/updateShop': ['shopName'],
    
    // Coupon routes
    'POST:/api/v1/coupon/create': ['code', 'discount', 'expiryDate'],
    'PATCH:/api/v1/coupon/edit': ['code', 'discount'],
    
    // Employee routes - Updated for user model
    'POST:/api/v1/employee/add': ['userName', 'email', 'department', 'designation', 'salary'],
    'PATCH:/api/v1/employee/update': ['userName', 'email'],
    'POST:/api/v1/employee/addSalary': ['employeeId', 'amount'],
    'POST:/api/v1/employee/leave': ['startDate', 'endDate', 'reason'],
    
    // Review routes
    'POST:/api/v1/review/create': ['productId', 'rating', 'comment'],
    'PATCH:/api/v1/review/update': ['rating', 'comment'],
    
    // Notification routes
    'POST:/api/v1/notification/create': ['title', 'message', 'type'],
    'PUT:/api/v1/notification/update': ['isRead'],
    
    // Cart routes
    'POST:/api/v1/cart/add': ['productId', 'quantity'],
    'POST:/api/v1/cart/update': ['productId', 'quantity'],
    'PATCH:/api/v1/cart/remove': ['productId'],
    
    // Wishlist routes
    'POST:/api/v1/wishlist/add': ['productId'],
    'POST:/api/v1/wishlist/remove': ['productId'],
    
    // Admin routes
    'PATCH:/api/v1/admin/ban': ['reason'],
    'PATCH:/api/v1/admin/role': ['role'],
    
    // Invoice routes
    'POST:/api/v1/invoice/get': ['orderId'],
    'POST:/api/v1/invoice/create': ['orderId', 'items'],
    
    // Transaction routes
    'POST:/api/v1/transaction/addMoney': ['amount'],
    'POST:/api/v1/transaction/applyWallet': ['orderId', 'amount'],
    
    // Payment routes
    'POST:/api/v1/payment/create-order': ['amount', 'currency'],
    'POST:/api/v1/payment/verify-payment': ['paymentId', 'orderId'],
    
    // Return routes
    'POST:/api/v1/return/returnRequest': ['orderId', 'reason'],
    'POST:/api/v1/return/approveRequest': ['returnId'],
    
    // Department routes
    'POST:/api/v1/department/add': ['name', 'description'],
    'PATCH:/api/v1/department/update': ['name'],
    
    // Email routes
    'POST:/api/v1/email/sendAll': ['subject', 'message'],
    'POST:/api/v1/email/send': ['subject', 'message'],
    
    // Event routes
    'POST:/api/v1/event/create': ['title', 'description', 'startDate'],
    'PATCH:/api/v1/event/update': ['title', 'description'],
    
    // QNA routes
    'POST:/api/v1/qna/create': ['question', 'answer'],
    'PUT:/api/v1/qna/update': ['question', 'answer'],
    
    // Rack routes
    'POST:/api/v1/rack': ['rackNumber', 'location'],
    'POST:/api/v1/rack/addToRack': ['productId', 'rackId'],
    
    // Reward routes
    'POST:/api/v1/reward/create': ['title', 'points', 'description'],
    'PATCH:/api/v1/reward/edit': ['title', 'points'],
    
    // Scratch routes
    'POST:/api/v1/scratch': ['scratchCardId'],
    
    // Warehouse routes
    'POST:/api/v1/warehouse/create': ['warehouseName', 'location'],
    'POST:/api/v1/warehouse/cart/add': ['productId', 'quantity'],
    
    // WhatsApp routes
    'POST:/api/v1/whatsapp/message': ['phoneNumber', 'message'],
    
    // Permission routes
    'POST:/api/v1/permission/permissions': ['name', 'resource', 'actions'],
    'POST:/api/v1/permission/roles': ['name', 'permissions'],
    'POST:/api/v1/permission/assign-role': ['userId', 'roleId']
  };
  
  // Create key from method and URL (remove dynamic params)
  const cleanUrl = url.replace(/\/\d+/g, '').replace(/\/[a-f0-9]{24}/g, '');
  const key = `${method}:${cleanUrl}`;
  
  return fieldMap[key] || [];
};

// Validation rules for different entities
export const validateUser = [
  body('userName').notEmpty().withMessage('Username is required').isLength({ min: 2 }).withMessage('Username must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number required')
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

export const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('price').isNumeric().withMessage('Price must be a number').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('category').notEmpty().withMessage('Category is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity is required and must be a positive integer'),
  body('itemTag').notEmpty().withMessage('Item tag is required'),
  body('shippingTag').optional().isString().withMessage('Shipping tag must be a string'),
  body('discount').optional().isNumeric().withMessage('Discount must be a number')
];

export const validateCategory = [
  body('name').notEmpty().withMessage('Category name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('type').notEmpty().withMessage('Category type is required').isIn(['main', 'gift', 'home', 'fashion']).withMessage('Type must be one of: main, gift, home, fashion')
];

export const validateOrder = [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').optional().isIn(['Cash', 'Online']).withMessage('Payment method must be Cash or Online')
];

export const validateCoupon = [
  body('couponCode').notEmpty().withMessage('Coupon code is required').isLength({ min: 3 }).withMessage('Code must be at least 3 characters'),
  body('couponDiscount').isNumeric().withMessage('Discount must be a number').isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0-100'),
  body('couponExpiry').isISO8601().withMessage('Valid expiry date is required'),
  body('minOrderAmount').optional().isNumeric().withMessage('Minimum order amount must be a number')
];

export const validateEmployee = [
  body('userName').notEmpty().withMessage('Employee name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('department').notEmpty().withMessage('Department is required'),
  body('salary').isNumeric().withMessage('Salary must be a number').isFloat({ min: 0 }).withMessage('Salary must be positive'),
  body('designation').notEmpty().withMessage('Designation is required'),
  body('dateOfJoined').optional().isISO8601().withMessage('Valid joining date required')
];

export const validateShop = [
  body('shopName').notEmpty().withMessage('Shop name is required').isLength({ min: 2 }).withMessage('Shop name must be at least 2 characters'),
  body('location').isObject().withMessage('Location is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('location.passcode').notEmpty().withMessage('Passcode is required'),
  body('contactNumber').notEmpty().withMessage('Contact number is required').isMobilePhone().withMessage('Valid contact number required')
];

export const validateReview = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
  body('comment').notEmpty().withMessage('Review comment is required').isLength({ min: 10 }).withMessage('Comment must be at least 10 characters')
];

export const validateNotification = [
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  body('type').notEmpty().withMessage('Notification type is required').isIn(['info', 'warning', 'success', 'error']).withMessage('Type must be: info, warning, success, or error')
];

export const validateCart = [
  body('productId').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

export const validateWishlist = [
  body('productId').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Valid product ID required')
];

export const validateTransaction = [
  body('amount').isNumeric().withMessage('Amount is required and must be a number').isFloat({ min: 1 }).withMessage('Amount must be at least 1')
];

export const validateChatbot = [
  body('question').notEmpty().withMessage('Question is required').isLength({ min: 3 }).withMessage('Question must be at least 3 characters')
];

export const validateDepartment = [
  body('name').notEmpty().withMessage('Department name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').optional().isString().withMessage('Description must be a string')
];

export const validateEmail = [
  body('subject').notEmpty().withMessage('Email subject is required'),
  body('message').notEmpty().withMessage('Email message is required').isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
];

export const validateEvent = [
  body('title').notEmpty().withMessage('Event title is required'),
  body('description').notEmpty().withMessage('Event description is required'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required')
];

export const validateQNA = [
  body('question').notEmpty().withMessage('Question is required').isLength({ min: 5 }).withMessage('Question must be at least 5 characters'),
  body('answer').notEmpty().withMessage('Answer is required').isLength({ min: 5 }).withMessage('Answer must be at least 5 characters')
];

export const validateRack = [
  body('rackNo').optional().isString().withMessage('Rack number must be a string'),
  body('rowNo').optional().isString().withMessage('Row number must be a string'),
  body('maxCapacity').optional().isInt({ min: 1 }).withMessage('Max capacity must be at least 1'),
  body('currentQuantity').optional().isInt({ min: 0 }).withMessage('Current quantity must be non-negative')
];

export const validateReward = [
  body('type').notEmpty().withMessage('Reward type is required'),
  body('value').isNumeric().withMessage('Reward value must be a number').isFloat({ min: 0 }).withMessage('Value must be non-negative'),
  body('probability').optional().isFloat({ min: 0, max: 1 }).withMessage('Probability must be between 0 and 1')
];

export const validateWarehouse = [
  body('name').notEmpty().withMessage('Warehouse name is required'),
  body('location').notEmpty().withMessage('Warehouse location is required'),
  body('managerId').optional().isMongoId().withMessage('Valid manager ID required')
];

export const validateWhatsApp = [
  body('phoneNumber').notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Valid phone number required'),
  body('message').notEmpty().withMessage('Message is required').isLength({ min: 1 }).withMessage('Message cannot be empty')
];

// Check if request body is empty
export const checkEmptyBody = (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is empty',
        errors: [{
          field: 'body',
          message: 'Request body cannot be empty',
          value: null
        }],
        requiredFields: getRequiredFields(req.originalUrl, req.method)
      });
    }
  }
  next();
};

