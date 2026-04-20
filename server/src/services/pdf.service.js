const path       = require('path');
const fs         = require('fs/promises');
const Handlebars = require('handlebars');
const { getBrowser } = require('./browser.pool');
const storage    = require('../storage/local.storage');
const documentRepo = require('../repositories/document.repository');
const { formatCOP } = require('../utils/formatCurrency');
const { formatDate, formatDateLong } = require('../utils/dateUtils');
const { BASE_UPLOAD_PATH } = require('../../config/constants');
const { v4: uuidv4 } = require('uuid');

// Register Handlebars helpers
Handlebars.registerHelper('formatCOP', (val) => formatCOP(val));
Handlebars.registerHelper('formatDate', (val) => formatDate(val));
Handlebars.registerHelper('formatDateLong', (val) => formatDateLong(val));
Handlebars.registerHelper('gt', (a, b) => a > b);
Handlebars.registerHelper('eq', (a, b) => a === b);

const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

// Cache de plantillas compiladas — se leen una sola vez del disco
const _templateCache = new Map();

/**
 * Devuelve la plantilla Handlebars compilada, con cache en memoria.
 */
async function getTemplate(docType) {
  if (_templateCache.has(docType)) return _templateCache.get(docType);

  const templatePath = path.join(TEMPLATES_DIR, `${docType}.html`);
  const templateSrc  = await fs.readFile(templatePath, 'utf-8');
  const compiled     = Handlebars.compile(templateSrc);
  _templateCache.set(docType, compiled);
  return compiled;
}

// Cache del CSS base
let _baseCssCache = null;

async function getBaseCss() {
  if (_baseCssCache) return _baseCssCache;
  const baseCssPath = path.join(TEMPLATES_DIR, 'styles', 'base.css');
  _baseCssCache = await fs.readFile(baseCssPath, 'utf-8');
  return _baseCssCache;
}

/**
 * Reads an image stored in BASE_UPLOAD_PATH and returns a base64 data URI.
 * relativePath is relative to BASE_UPLOAD_PATH (e.g. "usr_demo001/logo.png").
 */
async function getBase64Image(relativePath) {
  if (!relativePath) return null;
  try {
    // Normalizar la ruta para evitar problemas con slashes iniciales en path.join
    const cleanRelativePath = relativePath.startsWith('/') || relativePath.startsWith('\\') 
      ? relativePath.substring(1) 
      : relativePath;
      
    const absPath = path.join(BASE_UPLOAD_PATH, cleanRelativePath);
    
    // Verificar si el archivo existe antes de leerlo
    await fs.access(absPath);
    
    const imgBuf = await fs.readFile(absPath);
    const ext = path.extname(absPath).substring(1).toLowerCase() || 'png';
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    
    return `data:image/${mime};base64,${imgBuf.toString('base64')}`;
  } catch (err) {
    console.error(`[PDF Service] Error cargando imagen (${relativePath}):`, err.message);
    return null;
  }
}

/**
 * Generates a PDF buffer from the given doc type and data.
 * Usa un browser pool reutilizable para máxima velocidad.
 * @param {string} docType  cuenta-cobro | cotizacion | contrato
 * @param {object} data     output of documents.service.buildDocumentData()
 * @returns {Promise<Buffer>}
 */
async function generate(docType, data) {
  if (data.company) {
    data.company = { ...data.company };
    // Cargar imágenes en paralelo
    const [logoB64, signB64] = await Promise.all([
      data.company.logoPath ? getBase64Image(data.company.logoPath) : null,
      data.company.signPath ? getBase64Image(data.company.signPath) : null,
    ]);
    data.company.logoPath = logoB64;
    data.company.signPath = signB64;
  }

  // Cargar template y CSS en paralelo (con cache)
  const [template, baseCss] = await Promise.all([
    getTemplate(docType),
    getBaseCss(),
  ]);

  const baseCssTag = `<style>\n${baseCss}\n</style>`;
  const html = template({ ...data, baseCssTag });

  // Usar el browser pool en vez de launch/close cada vez
  const browser = await getBrowser();
  const page    = await browser.newPage();

  try {
    // Viewport fijo para consistencia en el layout del PDF
    await page.setViewport({ width: 816, height: 1056 });

    // 'domcontentloaded' es suficiente porque las plantillas son self-contained
    // (imágenes ya están inline como base64)
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const buffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return buffer;
  } finally {
    await page.close(); // Solo cierra la pestaña, no el browser completo
  }
}

/**
 * Saves the PDF buffer to storage and registers the document in the user's history.
 * @param {string} userId
 * @param {string} docType
 * @param {string} docNumber  e.g. "COT-0001"
 * @param {Buffer} buffer
 * @param {object} metadata   Extra fields to store in history
 * @returns {object} the saved document entry
 */
async function saveAndRegister(userId, docType, docNumber, buffer, metadata = {}) {
  const id           = uuidv4();
  const filename     = `${docNumber}.pdf`;
  const relativePath = `${userId}/docs/${filename}`;

  await storage.save(relativePath, buffer);

  const docEntry = {
    id,
    type: docType,
    number: docNumber,
    title: metadata.title || docNumber,
    filePath: relativePath,
    clientName: metadata.clientName || '',
    total: metadata.total || 0,
    createdAt: new Date().toISOString(),
  };

  await documentRepo.addDocument(userId, docEntry);
  return docEntry;
}

module.exports = { generate, saveAndRegister };
