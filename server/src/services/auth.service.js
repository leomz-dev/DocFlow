const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');
const userRepo = require('../repositories/user.repository');

/**
 * Verifies credentials and returns JWT + company data.
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string, user: object }}
 */
async function login(email, password) {
  const user = userRepo.findByEmail(email);
  if (!user || !user.active) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Return user data without password
  const { password: _pw, ...safeUser } = user;
  return { token, user: safeUser };
}

/**
 * Verifies a JWT and returns its payload.
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw Object.assign(new Error('Token inválido o expirado'), { status: 401 });
  }
}

/**
 * Hashes a plain-text password.
 * @param {string} plain
 * @returns {Promise<string>}
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

module.exports = { login, verifyToken, hashPassword };
