const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Load env from root .env (already loaded by config/env.js)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
