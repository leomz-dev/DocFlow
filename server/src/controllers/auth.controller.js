const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Placeholder for refresh token logic (Phase 2: Redis store)
async function refresh(req, res) {
  res.status(501).json({ error: 'Refresh token not implemented in Phase 1' });
}

module.exports = { login, refresh };
