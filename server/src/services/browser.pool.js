/**
 * Browser Pool — singleton de Puppeteer reutilizable.
 *
 * En vez de abrir y cerrar Chrome en cada petición PDF (lento y pesado),
 * mantenemos UNA instancia viva y solo abrimos pestañas nuevas.
 * Esto reduce el tiempo de generación de ~3s a ~500ms.
 */
const puppeteer = require('puppeteer');

let _browser = null;
let _launching = null;

const LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',      // Evita crashes por /dev/shm pequeño en Docker
  '--disable-gpu',                 // No necesitamos GPU para PDFs
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-sync',
  '--disable-translate',
  '--no-first-run',
  '--single-process',              // Menos procesos hijos = menos RAM
  '--font-render-hinting=none',    // Más rápido sin hinting
];

/**
 * Devuelve la instancia compartida de Puppeteer.
 * Si el browser se cerró, la re-crea automáticamente.
 */
async function getBrowser() {
  if (_browser && _browser.isConnected()) return _browser;

  // Evitar launches concurrentes
  if (_launching) return _launching;

  try {
    _launching = puppeteer.launch({
      headless: 'new',
      args: LAUNCH_ARGS,
      protocolTimeout: 30_000,
      // En Docker, usa el Chromium del sistema via la variable de entorno
      ...(process.env.PUPPETEER_EXECUTABLE_PATH && {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      }),
    });

    _browser = await _launching;
    _launching = null;

    // Si se desconecta, limpiar la referencia
    _browser.on('disconnected', () => {
      _browser = null;
    });

    return _browser;
  } catch (err) {
    _launching = null;
    console.error('❌ Puppeteer failed to launch:', err.message);
    throw new Error('PDF generation is unavailable: ' + err.message);
  }
}

/**
 * Cierre limpio al apagar el servidor.
 */
async function closeBrowser() {
  if (_browser) {
    try {
      await _browser.close();
    } catch { /* ignore */ }
    _browser = null;
  }
}

// Cleanup al cerrar el proceso
process.on('SIGTERM', closeBrowser);
process.on('SIGINT', closeBrowser);

module.exports = { getBrowser, closeBrowser };
