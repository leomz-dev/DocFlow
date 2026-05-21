const prisma = require('../config/prisma');

function buildCompanyCreateData(company, userBaseData = {}) {
  const source = company || {};
  return {
    name: source.name ?? userBaseData.name ?? 'Mi empresa',
    nit: source.nit ?? '',
    address: source.address ?? '',
    phone: source.phone ?? '',
    email: source.email ?? userBaseData.email ?? '',
    city: source.city ?? null,
    department: source.department ?? null,
    country: source.country ?? null,
    website: source.website ?? null,
    tagline: source.tagline ?? null,
    legalRep: source.legalRep ?? null,
    legalRepId: source.legalRepId ?? null,
    logoPath: source.logoPath ?? null,
    signPath: source.signPath ?? null,
    paymentMethods: source.paymentMethods ?? [],
    ivaRate: source.ivaRate ?? 19,
    retencionRate: source.retencionRate ?? 3.5,
    regimenTributario: source.regimenTributario ?? null,
  };
}

const userInclude = {
  company: true,
  counters: true,
  templates: true,
  documents: true,
  clients: true,
};

const legacyCompanySelect = {
  id: true,
  name: true,
  nit: true,
  address: true,
  phone: true,
  email: true,
  city: true,
  department: true,
  country: true,
  website: true,
  tagline: true,
  legalRep: true,
  legalRepId: true,
  logoPath: true,
  signPath: true,
  ivaRate: true,
  retencionRate: true,
  regimenTributario: true,
  userId: true,
};

const legacyUserInclude = {
  company: { select: legacyCompanySelect },
  counters: true,
  templates: true,
  documents: true,
  clients: true,
};

function isMissingPaymentMethodsColumnError(err) {
  const message = err?.message || '';
  return (
    err?.code === 'P2022' &&
    message.includes('Company.paymentMethods')
  );
}

function normalizeLegacyCompany(user) {
  if (!user?.company) return user;
  return {
    ...user,
    company: {
      ...user.company,
      paymentMethods: Array.isArray(user.company.paymentMethods) ? user.company.paymentMethods : [],
    },
  };
}

function omitPaymentMethods(company) {
  if (!company) return company;
  const { paymentMethods, ...rest } = company;
  return rest;
}

/** Busca un usuario por ID */
async function findById(id) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: userInclude,
    }) || null;
  } catch (err) {
    if (!isMissingPaymentMethodsColumnError(err)) throw err;
    const user = await prisma.user.findUnique({
      where: { id },
      include: legacyUserInclude,
    });
    return normalizeLegacyCompany(user) || null;
  }
}

/** Busca un usuario por email (case-insensitive) */
async function findByEmail(email) {
  try {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: userInclude,
    }) || null;
  } catch (err) {
    if (!isMissingPaymentMethodsColumnError(err)) throw err;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: legacyUserInclude,
    });
    return normalizeLegacyCompany(user) || null;
  }
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
  const compCreate = cleanComp ? buildCompanyCreateData(cleanComp, baseData) : undefined;

  const cleanTemp = templates ? { ...templates } : undefined;
  if (cleanTemp) delete cleanTemp.userId;

  const cleanCount = counters ? { ...counters } : undefined;
  if (cleanCount) delete cleanCount.userId;

  try {
    return await prisma.user.upsert({
      where: { id: id || '' },
      update: {
        ...baseData,
        company: cleanComp ? { upsert: { create: compCreate, update: cleanComp } } : undefined,
        templates: cleanTemp ? { upsert: { create: cleanTemp, update: cleanTemp } } : undefined,
        counters: cleanCount ? { upsert: { create: cleanCount, update: cleanCount } } : undefined,
      },
      create: {
        ...baseData,
        id: id,
        company: cleanComp ? { create: compCreate } : undefined,
        templates: cleanTemp ? { create: cleanTemp } : undefined,
        counters: cleanCount ? { create: cleanCount } : { create: {} },
      },
      include: userInclude,
    });
  } catch (err) {
    if (!isMissingPaymentMethodsColumnError(err)) throw err;

    const legacyComp = omitPaymentMethods(cleanComp);
    const legacyCompCreate = omitPaymentMethods(compCreate);

    const user = await prisma.user.upsert({
      where: { id: id || '' },
      update: {
        ...baseData,
        company: legacyComp ? { upsert: { create: legacyCompCreate, update: legacyComp } } : undefined,
        templates: cleanTemp ? { upsert: { create: cleanTemp, update: cleanTemp } } : undefined,
        counters: cleanCount ? { upsert: { create: cleanCount, update: cleanCount } } : undefined,
      },
      create: {
        ...baseData,
        id: id,
        company: legacyComp ? { create: legacyCompCreate } : undefined,
        templates: cleanTemp ? { create: cleanTemp } : undefined,
        counters: cleanCount ? { create: cleanCount } : { create: {} },
      },
      include: legacyUserInclude,
    });

    return normalizeLegacyCompany(user);
  }
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
