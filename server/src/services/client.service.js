const repo = require('../repositories/client.repository');

async function getAllClients(userId) {
  return await repo.findAll(userId);
}

async function getClientById(id) {
  const client = await repo.findById(id);
  if (!client) throw new Error('Cliente no encontrado');
  return client;
}

async function createClient(data) {
  // Nota: Dejamos que Prisma maneje el ID o usamos data.id si viene del frontend.
  // Pero mantenemos la coherencia de fechas.
  const clientData = {
    ...data,
    createdAt: new Date().toISOString()
  };
  return await repo.save(clientData);
}

async function updateClient(id, data) {
  const existing = await getClientById(id);
  const updated = {
    ...existing,
    ...data,
    id, // ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  return await repo.save(updated);
}

async function deleteClient(id) {
  const deleted = await repo.remove(id);
  if (!deleted) throw new Error('Cliente no encontrado o no se pudo eliminar');
  return true;
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
