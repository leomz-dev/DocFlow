const prisma = require('../config/prisma');

/**
 * Lista el historial de documentos de un usuario.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function listByUser(userId) {
  return await prisma.document.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Agrega un documento al historial del usuario.
 * @param {string} userId
 * @param {{ id, type, number, title, filePath, clientName, total, createdAt }} docEntry
 */
async function addDocument(userId, docEntry) {
  return await prisma.document.create({
    data: {
      ...docEntry,
      userId,
    },
  });
}

/**
 * Busca un documento específico del usuario.
 * @param {string} userId
 * @param {string} docId
 * @returns {Promise<Object|null>}
 */
async function findDocument(userId, docId) {
  return await prisma.document.findFirst({
    where: {
      id: docId,
      userId,
    },
  });
}

/**
 * Elimina un documento del historial del usuario.
 * @param {string} userId
 * @param {string} docId
 * @returns {Promise<boolean>}
 */
async function deleteDocument(userId, docId) {
  try {
    await prisma.document.delete({
      where: {
        id: docId,
        userId,
      },
    });
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { listByUser, addDocument, findDocument, deleteDocument };
