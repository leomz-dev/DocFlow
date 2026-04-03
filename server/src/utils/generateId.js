const { v4: uuidv4 } = require('uuid');

/**
 * Generates a prefixed unique ID.
 * @param {string} prefix  e.g. "usr", "doc"
 * @returns {string}       e.g. "usr_3f2504e0"
 */
function genId(prefix) {
  const short = uuidv4().replace(/-/g, '').slice(0, 8);
  return `${prefix}_${short}`;
}

module.exports = { genId };
