const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID } = require('../../config/env');
const userRepo = require('../repositories/user.repository');

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token and returns the payload.
 */
async function verifyGoogleToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw Object.assign(new Error('Token de Google inválido'), { status: 401 });
  }
  return payload;
}

/**
 * Authenticates via Google OAuth.
 */
async function loginWithGoogle(googleIdToken) {
  const googlePayload = await verifyGoogleToken(googleIdToken);
  const { email, name, sub: googleId, picture } = googlePayload;

  let user = await userRepo.findByEmail(email.toLowerCase());

  if (user && !user.active) {
    throw Object.assign(new Error('Cuenta desactivada'), { status: 403 });
  }

  if (!user) {
    const { v4: uuidv4 } = require('uuid');
    const newId = uuidv4();

    user = await userRepo.save({
      id: newId,
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: null,
      googleId,
      avatarUrl: picture || null,
      role: 'admin',
      active: true,
      counters: { cuentaCobro: 0, cotizacion: 0, contrato: 0 },
      templates: { cuentaCobro: 'default', cotizacion: 'default', contrato: 'default' },
    });
  } else if (!user.googleId) {
    await userRepo.save({
      ...user,
      googleId,
      avatarUrl: user.avatarUrl || picture || null,
    });
    user = await userRepo.findByEmail(email.toLowerCase());
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const { password: _pw, ...safeUser } = user;
  return { token, user: safeUser };
}

/**
 * Verifies a JWT.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw Object.assign(new Error('Token inválido o expirado'), { status: 401 });
  }
}

module.exports = { loginWithGoogle, verifyToken };
