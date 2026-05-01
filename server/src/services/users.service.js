const userRepo = require('../repositories/user.repository');
const storage  = require('../storage/local.storage');
const sharp = require('sharp');

const ALLOWED_IMAGE_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/heic',
  'image/heif',
]);

async function normalizeImageToPng(buffer, mimetype) {
  if (!ALLOWED_IMAGE_MIMES.has(String(mimetype || '').toLowerCase())) {
    throw Object.assign(new Error('Formato de imagen no soportado. Use PNG, JPG, WEBP o HEIC.'), { status: 400 });
  }

  try {
    return await sharp(buffer).rotate().png().toBuffer();
  } catch {
    throw Object.assign(new Error('No se pudo procesar la imagen. Intente con otro archivo.'), { status: 400 });
  }
}

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

    // Validate & sanitize paymentMethods (max 3)
    if (clean.paymentMethods !== undefined) {
      clean.paymentMethods = sanitizePaymentMethods(clean.paymentMethods);
    }

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
 * Validates and sanitizes the paymentMethods array.
 * - Must be an array, max 3 elements.
 * - Each element keeps only { bankName, bankAccountType, bankAccountNum, bankHolder }.
 * - Removes entries where all 4 fields are empty.
 */
function sanitizePaymentMethods(methods) {
  if (!Array.isArray(methods)) return [];

  const ALLOWED_KEYS = ['bankName', 'bankAccountType', 'bankAccountNum', 'bankHolder'];

  const cleaned = methods
    .slice(0, 3) // enforce max 3
    .map(m => {
      const entry = {};
      for (const key of ALLOWED_KEYS) {
        entry[key] = typeof m[key] === 'string' ? m[key].trim() : '';
      }
      return entry;
    })
    .filter(m => ALLOWED_KEYS.some(k => m[k].length > 0)); // remove fully empty

  return cleaned;
}

/**
 * Saves a logo file and updates logoPath.
 */
async function uploadLogo(userId, buffer, mimetype) {
  const relativePath = `usuarios/${userId}/logo.png`;
  const pngBuffer = await normalizeImageToPng(buffer, mimetype);
  await storage.save(relativePath, pngBuffer);

  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  user.company = user.company || {};
  user.company.logoPath = relativePath;
  await userRepo.save(user);
  const { password: _pw, ...safe } = user;
  return safe;
}

/**
 * Saves a signature file and updates signPath.
 */
async function uploadSign(userId, buffer, mimetype) {
  const relativePath = `usuarios/${userId}/firma.png`;
  const pngBuffer = await normalizeImageToPng(buffer, mimetype);
  await storage.save(relativePath, pngBuffer);

  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  user.company = user.company || {};
  user.company.signPath = relativePath;
  await userRepo.save(user);
  const { password: _pw, ...safe } = user;
  return safe;
}

module.exports = { getProfile, updateCompany, uploadLogo, uploadSign };
