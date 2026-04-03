const fs = require('fs');
const { DATA_PATH } = require('../../config/constants');

function readDB() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Lista el historial de documentos de un usuario.
 * @param {string} userId
 * @returns {Array}
 */
function listByUser(userId) {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return [];
  return (user.documents || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Agrega un documento al historial del usuario.
 * @param {string} userId
 * @param {{ id, type, number, title, filePath, createdAt }} docEntry
 */
function addDocument(userId, docEntry) {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);
  if (!user.documents) user.documents = [];
  user.documents.push(docEntry);
  writeDB(db);
  return docEntry;
}

/**
 * Busca un documento específico del usuario.
 * @param {string} userId
 * @param {string} docId
 * @returns {{ doc, filePath } | null}
 */
function findDocument(userId, docId) {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  const doc = (user.documents || []).find((d) => d.id === docId);
  return doc || null;
}

/**
 * Elimina un documento del historial del usuario.
 * @param {string} userId
 * @param {string} docId
 * @returns {boolean}
 */
function deleteDocument(userId, docId) {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user || !user.documents) return false;
  const before = user.documents.length;
  user.documents = user.documents.filter((d) => d.id !== docId);
  if (user.documents.length === before) return false;
  writeDB(db);
  return true;
}

module.exports = { listByUser, addDocument, findDocument, deleteDocument };
