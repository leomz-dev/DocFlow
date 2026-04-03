const { IS_DEV } = require('../../config/env');

/**
 * Global error handler middleware (must be last app.use()).
 * Maps known properties (err.status) to HTTP codes.
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const status  = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  if (IS_DEV) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  }

  res.status(status).json({
    error: message,
    ...(IS_DEV && { stack: err.stack }),
  });
}

module.exports = errorMiddleware;
