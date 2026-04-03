const fs = require('fs');
const { CLIENTS_DATA_PATH } = require('../../config/constants');

function readDB() {
  if (!fs.existsSync(CLIENTS_DATA_PATH)) {
    fs.writeFileSync(CLIENTS_DATA_PATH, JSON.stringify([]), 'utf-8');
  }
  const raw = fs.readFileSync(CLIENTS_DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(CLIENTS_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function findAll() {
  return readDB();
}

function findById(id) {
  return readDB().find((c) => c.id === id) || null;
}

function save(client) {
  const db = readDB();
  const idx = db.findIndex((c) => c.id === client.id);
  if (idx === -1) {
    db.push(client);
  } else {
    db[idx] = client;
  }
  writeDB(db);
  return client;
}

function remove(id) {
  let db = readDB();
  const filtered = db.filter((c) => c.id !== id);
  writeDB(filtered);
  return filtered.length !== db.length;
}

module.exports = { findAll, findById, save, remove };
