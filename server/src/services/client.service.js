const crypto = require('crypto');
const repo = require('../repositories/client.repository');

function getAllClients() {
  return repo.findAll();
}

function getClientById(id) {
  const client = repo.findById(id);
  if (!client) throw new Error('Cliente no encontrado');
  return client;
}

function createClient(data) {
  const client = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString()
  };
  return repo.save(client);
}

function updateClient(id, data) {
  const existing = getClientById(id);
  const updated = {
    ...existing,
    ...data,
    id, // ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  return repo.save(updated);
}

function deleteClient(id) {
  const deleted = repo.remove(id);
  if (!deleted) throw new Error('Cliente no encontrado');
  return true;
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
