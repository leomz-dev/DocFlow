/**
 * Script para crear un usuario de prueba en la base de datos.
 * Uso: node scripts/create-user.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createUser() {
  const password = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Leonardo Meza',
      email: 'admin@docflow.com',
      password,
      role: 'admin',
      active: true,
      company: {
        create: {
          name: 'Mi Empresa S.A.S',
          nit: '900.123.456-7',
          address: 'Calle 123 #45-67',
          phone: '3000000000',
          email: 'contacto@miempresa.com',
          city: 'Barranquilla',
          department: 'Atlántico',
          country: 'Colombia',
        }
      },
      counters: {
        create: {}
      },
      templates: {
        create: {}
      }
    },
    include: {
      company: true,
      counters: true,
      templates: true,
    }
  });

  console.log('✅ Usuario creado exitosamente:');
  console.log(`   Email: admin@docflow.com`);
  console.log(`   Password: admin123`);
  console.log(`   ID: ${user.id}`);
}

createUser()
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => prisma.$disconnect());
