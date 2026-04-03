const path       = require('path');
const fs         = require('fs/promises');
const Handlebars = require('handlebars');
const puppeteer  = require('puppeteer');
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

/**
 * Reads an image stored in BASE_UPLOAD_PATH and returns a base64 data URI.
 * relativePath is relative to BASE_UPLOAD_PATH (e.g. "usr_demo001/logo.png").
 */
async function getBase64Image(relativePath) {
  if (!relativePath) return null;
  try {
    const absPath = path.join(BASE_UPLOAD_PATH, relativePath);
    const imgBuf = await fs.readFile(absPath);
    const ext = path.extname(absPath).substring(1).toLowerCase() || 'png';
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mime};base64,${imgBuf.toString('base64')}`;
  } catch (err) {
    console.warn('Could not load image to base64:', relativePath, err.message);
    return null;
  }
}

/**
 * Generates a PDF buffer from the given doc type and data.
 * @param {string} docType  cuenta-cobro | cotizacion | contrato
 * @param {object} data     output of documents.service.buildDocumentData()
 * @returns {Promise<Buffer>}
 */
async function generate(docType, data) {
  if (data.company) {
    data.company = { ...data.company };
    if (data.company.logoPath) {
      data.company.logoPath = await getBase64Image(data.company.logoPath);
    }
    if (data.company.signPath) {
      data.company.signPath = await getBase64Image(data.company.signPath);
    }
  }

  // Load template HTML
  const templatePath = path.join(TEMPLATES_DIR, `${docType}.html`);
  const templateSrc  = await fs.readFile(templatePath, 'utf-8');

  // Load base CSS and embed it into the template data
  const baseCssPath = path.join(TEMPLATES_DIR, 'styles', 'base.css');
  const baseCss     = await fs.readFile(baseCssPath, 'utf-8');

  // Compile Handlebars template
  const template = Handlebars.compile(templateSrc);
  const baseCssTag = `<style>\n${baseCss}\n</style>`;
  const html     = template({ ...data, baseCssTag });

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return buffer;
  } finally {
    await browser.close();
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

  documentRepo.addDocument(userId, docEntry);
  return docEntry;
}

module.exports = { generate, saveAndRegister };
