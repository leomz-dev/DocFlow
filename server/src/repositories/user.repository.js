const fs = require('fs');
const path = require('path');
const { DATA_PATH } = require('../../config/constants');

/** Lee el JSON completo desde disco */
function readDB() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

/** Escribe el JSON completo a disco */
function writeDB(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/** Devuelve todos los usuarios */
function findAll() {
  return readDB().users;
}

/** Busca un usuario por ID */
function findById(id) {
  return readDB().users.find((u) => u.id === id) || null;
}

/** Busca un usuario por email (case-insensitive) */
function findByEmail(email) {
  return readDB().users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  ) || null;
}

/**
 * Inserta o actualiza un usuario completo.
 * Si ya existe un usuario con el mismo id, lo reemplaza.
 */
function save(user) {
  const db = readDB();
  const idx = db.users.findIndex((u) => u.id === user.id);
  if (idx === -1) {
    db.users.push(user);
  } else {
    db.users[idx] = user;
  }
  writeDB(db);
  return user;
}

/**
 * Incrementa atómicamente el contador del tipo de documento dado.
 * @param {string} userId
 * @param {'cuentaCobro'|'cotizacion'|'contrato'} counterKey
 * @returns {number} nuevo valor del contador
 */
function incrementCounter(userId, counterKey) {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);
  user.counters[counterKey] = (user.counters[counterKey] || 0) + 1;
  writeDB(db);
  return user.counters[counterKey];
}

module.exports = { findAll, findById, findByEmail, save, incrementCounter };
