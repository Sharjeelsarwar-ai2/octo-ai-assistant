export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function globalErrorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

export default {
  notFoundHandler,
  globalErrorHandler
};
