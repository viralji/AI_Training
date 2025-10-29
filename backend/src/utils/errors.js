// Error handling utilities
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR')
    this.field = field
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 403, 'FORBIDDEN')
  }
}

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email')
  }
  return true
}

export const validateRole = (role) => {
  const validRoles = ['trainer', 'trainee']
  if (!role || !validRoles.includes(role)) {
    throw new ValidationError('Invalid role. Must be trainer or trainee', 'role')
  }
  return true
}

export const validateAssignmentStatus = (status) => {
  const validStatuses = ['hidden', 'active', 'completed']
  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError('Invalid assignment status', 'status')
  }
  return true
}

export const validateScore = (score) => {
  if (score !== null && score !== undefined) {
    const numScore = Number(score)
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      throw new ValidationError('Score must be between 0 and 100', 'score')
    }
  }
  return true
}

export const validateTimeLimit = (timeLimit) => {
  if (timeLimit !== null && timeLimit !== undefined) {
    const numTimeLimit = Number(timeLimit)
    if (isNaN(numTimeLimit) || numTimeLimit < 30 || numTimeLimit > 3600) {
      throw new ValidationError('Time limit must be between 30 seconds and 1 hour', 'timeLimit')
    }
  }
  return true
}

// File validation utilities
export const validateImageFile = (file) => {
  if (!file) return true // Optional file
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ValidationError('Only image files are allowed (JPEG, PNG, GIF, WebP)', 'file')
  }
  
  if (file.size > maxSize) {
    throw new ValidationError('File size must be less than 5MB', 'file')
  }
  
  return true
}

// Database error handling
export const handleDatabaseError = (error) => {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    throw new ValidationError('Resource already exists', 'database')
  }
  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    throw new ValidationError('Referenced resource does not exist', 'database')
  }
  if (error.code === 'SQLITE_CONSTRAINT_NOTNULL') {
    throw new ValidationError('Required field is missing', 'database')
  }
  throw new AppError('Database operation failed', 500, 'DATABASE_ERROR')
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Global error handler
export const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = new NotFoundError(message)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered'
    error = new ValidationError(message)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ')
    error = new ValidationError(message)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
}


