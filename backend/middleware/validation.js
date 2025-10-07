import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Validation rules for user registration
export const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),

  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Position must be between 2 and 50 characters'),

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),

  handleValidationErrors
];

// Validation rules for user login
export const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password is required'),

  handleValidationErrors
];

// Validation rules for user update
export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),

  body('position')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Position cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Position must be between 2 and 50 characters'),

  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  handleValidationErrors
];

// Validation rules for attendance check-in/check-out
export const validateAttendance = [
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),

  handleValidationErrors
];

// Validation rules for attendance query parameters
export const validateAttendanceQuery = [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        const start = new Date(req.body.startDate);
        const end = new Date(endDate);
        if (end < start) {
          throw new Error('End date cannot be before start date');
        }
      }
      return true;
    }),

  handleValidationErrors
];

// Validation rules for password change
export const validatePasswordChange = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((newPassword, { req }) => {
      if (newPassword === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors
];

// Validation rules for user ID parameter
export const validateUserId = [
  body('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),

  handleValidationErrors
];

// Validation rules for location coordinates
export const validateLocation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required (-90 to 90)'),

  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required (-180 to 180)'),

  handleValidationErrors
];

// Sanitization middleware for general input cleaning
export const sanitizeInput = [
  body('*').escape(), // Escape HTML entities to prevent XSS
  body('email').normalizeEmail(), // Normalize email addresses
  body('name').trim().escape(),
  body('position').trim().escape(),
  body('department').trim().escape(),
  body('address').trim().escape()
];

// Custom validation for date range
export const validateDateRange = (startDateField = 'startDate', endDateField = 'endDate') => {
  return [
    body(startDateField)
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    
    body(endDateField)
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
      .custom((endDate, { req }) => {
        const startDate = req.body[startDateField];
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (end < start) {
            throw new Error('End date cannot be before start date');
          }
          
          // Check if date range is reasonable (e.g., not more than 1 year)
          const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
          if (end - start > oneYearInMs) {
            throw new Error('Date range cannot exceed 1 year');
          }
        }
        return true;
      }),

    handleValidationErrors
  ];
};

// Validation for bulk operations
export const validateBulkOperations = [
  body('userIds')
    .isArray()
    .withMessage('User IDs must be an array')
    .notEmpty()
    .withMessage('User IDs array cannot be empty'),
  
  body('userIds.*')
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ID'),

  body('action')
    .isIn(['activate', 'deactivate', 'delete'])
    .withMessage('Action must be one of: activate, deactivate, delete'),

  handleValidationErrors
];

// Export all validations as an object for easy import
export default {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateAttendance,
  validateAttendanceQuery,
  validatePasswordChange,
  validateUserId,
  validateLocation,
  sanitizeInput,
  validateDateRange,
  validateBulkOperations
};