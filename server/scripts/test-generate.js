/**
 * Script de diagnóstico: Simula exactamente lo que hace el endpoint /api/documents/generate
 * para cada usuario en la base de datos.
 */
require('../config/env');
const prisma = require('../src/config/prisma');
const documentsService = require('../src/services/documents.service');
const pdfService = require('../src/services/pdf.service');

const TEST_BODY = {
  type: 'cotizacion',
  client: {
    name: 'Cliente de Prueba',
    nit: '123456789',
    address: 'Calle 123',
    email: 'cliente@test.com',
    city: 'Bogotá',
    phone: '3001234567',
  },
  items: [
    { description: 'Servicio Web', quantity: 1, unitPrice: 500000 },
  ],
  notes: 'Sin observaciones',
  date: '2026-04-21',
  clauses: [],
  withRetention: false,
  withIVA: false,
};

async function run() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    console.log(`\nProbando con ${users.length} usuarios...\n`);

    for (const user of users) {
      console.log(`--- Usuario: ${user.email} (${user.id}) ---`);
      try {
        const docData = await documentsService.buildDocumentData(user.id, TEST_BODY);
        console.log('  ✅ buildDocumentData OK | company:', !!docData.company);

        const pdfBuffer = await pdfService.generate('cotizacion', docData);
        console.log('  ✅ pdfService.generate OK | bufferLen:', pdfBuffer.length);
      } catch (err) {
        console.error('  ❌ ERROR:', err.message);
        if (err.stack) console.error('     Stack:', err.stack.split('\n').slice(1, 4).join('\n'));
      }
    }
  } catch (e) {
    console.error('Fatal:', e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
