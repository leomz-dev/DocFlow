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

const app = express();

// ── Seguridad y parseo ──────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP desactivado para servir PDFs
app.use(cors({ origin: CLIENT_URL, credentials: true }));
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

app.listen(PORT, () => {
  console.log(`🚀 DocFlow server running on http://localhost:${PORT}`);
});

