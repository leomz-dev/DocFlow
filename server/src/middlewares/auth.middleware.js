const authService = require('../services/auth.service');

/**
 * Extracts and verifies the JWT from the Authorization header.
 * Injects req.user = { id, email, role } on success.
 */
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

module.exports = authMiddleware;
