const prisma = require('../config/prisma');

/** Busca un usuario por ID */
async function findById(id) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      company: true,
      counters: true,
      templates: true,
      documents: true,
      clients: true,
    },
  }) || null;
}

/** Busca un usuario por email (case-insensitive) */
async function findByEmail(email) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      company: true,
      counters: true,
      templates: true,
      documents: true,
      clients: true,
    },
  }) || null;
}

/**
 * Inserta o actualiza un usuario completo utilizando Prisma upsert.
 * Maneja la creación/actualización anidada de compañía, plantillas y contadores.
 */
async function save(userData) {
  const { 
    id, company, templates, counters, clients, documents, 
    createdAt, updatedAt, ...baseData 
  } = userData;

  // Aseguramos que el email sea minúscula
  if (baseData.email) baseData.email = baseData.email.toLowerCase();

  // Prisma no permite pasar la clave foránea (userId) manualmente en una escritura anidada
  const cleanComp = company ? { ...company } : undefined;
  if (cleanComp) delete cleanComp.userId;

  const cleanTemp = templates ? { ...templates } : undefined;
  if (cleanTemp) delete cleanTemp.userId;

  const cleanCount = counters ? { ...counters } : undefined;
  if (cleanCount) delete cleanCount.userId;

  return await prisma.user.upsert({
    where: { id: id || '' },
    update: {
      ...baseData,
      company: cleanComp ? { upsert: { create: cleanComp, update: cleanComp } } : undefined,
      templates: cleanTemp ? { upsert: { create: cleanTemp, update: cleanTemp } } : undefined,
      counters: cleanCount ? { upsert: { create: cleanCount, update: cleanCount } } : undefined,
    },
    create: {
      ...baseData,
      id: id,
      company: cleanComp ? { create: cleanComp } : undefined,
      templates: cleanTemp ? { create: cleanTemp } : undefined,
      counters: cleanCount ? { create: cleanCount } : { create: {} },
    },
    include: {
      company: true,
      counters: true,
      templates: true,
      documents: true,
      clients: true,
    },
  });
}

/**
 * Incrementa atómicamente el contador del tipo de documento dado.
 * @param {string} userId
 * @param {'cuentaCobro'|'cotizacion'|'contrato'} counterKey
 * @returns {number} nuevo valor del contador
 */
async function incrementCounter(userId, counterKey) {
  const updated = await prisma.counter.update({
    where: { userId },
    data: {
      [counterKey]: { increment: 1 }
    }
  });

  return updated[counterKey];
}

module.exports = { findById, findByEmail, save, incrementCounter };
