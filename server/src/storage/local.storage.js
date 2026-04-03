const fs = require('fs/promises');
const path = require('path');
const { BASE_UPLOAD_PATH } = require('../../config/constants');

/**
 * Saves a buffer to BASE_UPLOAD_PATH/<relativePath>.
 * Creates parent directories if they don't exist.
 * @param {string} relativePath  e.g. "usr_001/docs/CC-001.pdf"
 * @param {Buffer} buffer
 * @returns {Promise<void>}
 */
async function save(relativePath, buffer) {
  const abs = path.join(BASE_UPLOAD_PATH, relativePath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, buffer);
}

/**
 * Returns the absolute path for the given relative path.
 * @param {string} relativePath
 * @returns {string}
 */
function getPath(relativePath) {
  return path.join(BASE_UPLOAD_PATH, relativePath);
}

/**
 * Deletes the file at the given relative path (no error if not found).
 * @param {string} relativePath
 * @returns {Promise<void>}
 */
async function remove(relativePath) {
  const abs = path.join(BASE_UPLOAD_PATH, relativePath);
  try {
    await fs.unlink(abs);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

module.exports = { save, getPath, remove };
