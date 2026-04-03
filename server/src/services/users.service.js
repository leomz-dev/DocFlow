const path = require('path');
const userRepo = require('../repositories/user.repository');
const storage  = require('../storage/local.storage');

/**
 * Returns the user profile (without password).
 * @param {string} userId
 */
function getProfile(userId) {
  const user = userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  const { password: _pw, ...safe } = user;
  return safe;
}

/**
 * Updates user-level fields (name, email) and/or company data.
 * Accepts:
 *   - body.name / body.email  → top-level user fields
 *   - body.company            → merged into user.company (preferred)
 *   - any other keys          → merged into user.company for backward compat
 * Strips password-related and nested company keys to prevent data corruption.
 * @param {string} userId
 * @param {object} body  Request body from PUT /users/me
 */
function updateCompany(userId, body) {
  const user = userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  // ── User-level fields ──────────────────────────────────────────────
  if (body.name  !== undefined) user.name  = body.name;
  if (body.email !== undefined) user.email = body.email;

  // ── Company fields ─────────────────────────────────────────────────
  // Strip keys that must never land in company object
  const FORBIDDEN = ['currentPassword', 'newPassword', 'password', 'company', 'name', 'email'];

  if (body.company && typeof body.company === 'object') {
    // Preferred: client sends { company: { name, nit, ... } }
    const clean = Object.fromEntries(
      Object.entries(body.company).filter(([k]) => !FORBIDDEN.includes(k))
    );
    user.company = { ...user.company, ...clean };
  } else {
    // Legacy: client sends flat company fields at root level
    const clean = Object.fromEntries(
      Object.entries(body).filter(([k]) => !FORBIDDEN.includes(k))
    );
    if (Object.keys(clean).length > 0) {
      user.company = { ...user.company, ...clean };
    }
  }

  userRepo.save(user);
  const { password: _pw, ...safe } = user;
  return safe;
}

/**
 * Saves a logo file and updates logoPath.
 * @param {string} userId
 * @param {Buffer} buffer
 * @param {string} mimetype  e.g. "image/png"
 */
async function uploadLogo(userId, buffer, mimetype) {
  const ext = mimetype.split('/')[1] || 'png';
  const relativePath = `usuarios/${userId}/logo.${ext}`;
  await storage.save(relativePath, buffer);

  const user = userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  user.company.logoPath = relativePath;
  userRepo.save(user);
  const { password: _pw, ...safe } = user;
  return safe;
}

/**
 * Saves a signature file and updates signPath.
 */
async function uploadSign(userId, buffer, mimetype) {
  const ext = mimetype.split('/')[1] || 'png';
  const relativePath = `usuarios/${userId}/firma.${ext}`;
  await storage.save(relativePath, buffer);

  const user = userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  user.company.signPath = relativePath;
  userRepo.save(user);
  const { password: _pw, ...safe } = user;
  return safe;
}

module.exports = { getProfile, updateCompany, uploadLogo, uploadSign };
