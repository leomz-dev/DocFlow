# ── DocFlow Backend — Docker optimizado para Azure App Service ──────────
# Multi-stage build: instala dependencias, genera Prisma, y copia solo lo necesario.

# ─── Stage 1: Build ────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias del sistema para Prisma y Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar manifiestos e instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar esquema Prisma y generar el client
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

# ─── Stage 2: Runtime ──────────────────────────────────────────────────
FROM node:20-slim AS runtime

# Instalar Chromium y dependencias mínimas para Puppeteer
# + fuentes para que los PDFs se generen con tipografía correcta
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Indicar a Puppeteer que use el Chromium del sistema (no descargue otro)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    WEBSITES_PORT=8080

WORKDIR /app

# Copiar desde el builder solo lo necesario
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/index.js ./
COPY --from=builder /app/config ./config
COPY --from=builder /app/src ./src

# Crear directorio para uploads persistente
RUN mkdir -p /app/data/uploads && chown -R node:node /app

# Correr como usuario no-root por seguridad
USER node

# Puerto por defecto que usa Azure App Service
EXPOSE 8080

# Health check para Azure
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:8080/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "index.js"]
