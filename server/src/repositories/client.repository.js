const prisma = require('../config/prisma');

async function findAll(userId) {
  if (!userId) return await prisma.client.findMany();
  return await prisma.client.findMany({
    where: { userId }
  });
}

async function findById(id) {
  return await prisma.client.findUnique({
    where: { id }
  }) || null;
}

async function save(clientData) {
  const { id, ...data } = clientData;
  
  if (id) {
    return await prisma.client.upsert({
      where: { id },
      update: data,
      create: { ...data, id }
    });
  }
  
  return await prisma.client.create({
    data
  });
}

async function remove(id) {
  try {
    await prisma.client.delete({
      where: { id }
    });
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { findAll, findById, save, remove };
