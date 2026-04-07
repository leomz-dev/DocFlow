const userRepo = require('../repositories/user.repository');
const storage  = require('../storage/local.storage');

/**
 * Returns the user profile (without password).
 * @param {string} userId
 */
async function getProfile(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  const { password: _pw, ...safe } = user;
  return safe;
}

/**
 * Updates user-level fields (name, email) and/or company data.
 * @param {string} userId
 * @param {object} body  Request body from PUT /users/me
 */
async function updateCompany(userId, body) {
  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  // ── User-level fields ──────────────────────────────────────────────
  if (body.name !== undefined) user.name = body.name;
  
  // NOTE: Email is identity in Google OAuth. Changing it might desync the account.
  // We allow it here, but the frontend should probably disable it.
  if (body.email !== undefined) user.email = body.email.toLowerCase();

  // ── Company fields ─────────────────────────────────────────────────
  const FORBIDDEN = ['googleId', 'role', 'active', 'password', 'id'];

  if (body.company && typeof body.company === 'object') {
    const clean = Object.fromEntries(
      Object.entries(body.company).filter(([k]) => !FORBIDDEN.includes(k))
    );
    user.company = { ...user.company, ...clean };
  } else {
    const clean = Object.fromEntries(
      Object.entries(body).filter(([k]) => !FORBIDDEN.includes(k))
    );
    if (Object.keys(clean).length > 0) {
      user.company = { ...user.company, ...clean };
    }
  }

  await userRepo.save(user);
  const { password: _pw, ...safe } = user;
  return safe;
}

/**
 * Saves a logo file and updates logoPath.
 */
async function uploadLogo(userId, buffer, mimetype) {
  const ext = mimetype.split('/')[1] || 'png';
  const relativePath = `usuarios/${userId}/logo.${ext}`;
  await storage.save(relativePath, buffer);

  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  user.company.logoPath = relativePath;
  await userRepo.save(user);
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

  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  user.company.signPath = relativePath;
  await userRepo.save(user);
  const { password: _pw, ...safe } = user;
  return safe;
}

module.exports = { getProfile, updateCompany, uploadLogo, uploadSign };
