require('./config/env'); // valida variables de entorno primero
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PORT, CLIENT_URL } = require('./config/env');

const authRoutes      = require('./src/routes/auth.routes');
const usersRoutes     = require('./src/routes/users.routes');
const documentsRoutes = require('./src/routes/documents.routes');
const clientsRoutes   = require('./src/routes/clients.routes');
const errorMiddleware = require('./src/middlewares/error.middleware');
const prisma = require('./src/config/prisma');

const app = express();

const explicitAllowedOrigins = (CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // server-to-server, curl, health checks, etc.
  if (explicitAllowedOrigins.includes(origin)) return true;

  // Accept Azure Static Web Apps preview/production domains in production.
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.azurestaticapps.net');
  } catch {
    return false;
  }
};

// ── Seguridad y parseo ──────────────────────────────────────────────
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: { policy: "unsafe-none" },   // Permite popups y postMessage de Google OAuth
  crossOriginEmbedderPolicy: false,                      // Evita conflictos con recursos cross-origin
})); 
app.use(cors({ 
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rutas ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(require('path').join(__dirname, 'data/uploads')));
app.use('/api/auth',      authRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/clients',   clientsRoutes);

// ── Health check ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Manejador global de errores (debe ser el último middleware) ──────
app.use(errorMiddleware);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('🍃 PostgreSQL Connected via Prisma');
    
    app.listen(PORT, () => {
      console.log(`🚀 DocFlow server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
}

startServer();

