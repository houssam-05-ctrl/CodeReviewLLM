/**
 * Global error handling middleware.
 * Must be registered LAST in Express, after all routes.
 *
 * Handles:
 * - Mongoose CastError (invalid ObjectId)
 * - Mongoose ValidationError (schema validation failures)
 * - Mongoose duplicate key errors (code 11000)
 * - JWT errors (passed from authMiddleware)
 * - Generic server errors
 */

// Safely stringify an error for the stack field (hide in production)
const getStack = (err) =>
  process.env.NODE_ENV === 'production' ? undefined : err.stack;

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // --- Mongoose: bad ObjectId (e.g. /api/analyze/history with wrong id format)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  // --- Mongoose: schema validation failure
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // --- MongoDB: duplicate key (e.g. registering existing username)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // --- JWT: token errors (invalid signature, malformed, expired)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // --- Multer: file too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum allowed size is 1 MB.';
  }

  // --- Multer: unexpected field name
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field. Use "codeFile" as the field name.';
  }

  // --- Multer: unsupported file type (thrown manually in fileFilter)
  if (err.message && err.message.includes('Only plain-text source code')) {
    statusCode = 400;
    message = err.message;
  }

  // Log the full error in development for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${statusCode} — ${message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: getStack(err),
  });
};

/**
 * 404 handler for routes that don't exist.
 * Register this BEFORE the errorHandler, right after all routes.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};
