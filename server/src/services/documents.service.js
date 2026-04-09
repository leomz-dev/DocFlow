const userRepo     = require('../repositories/user.repository');
const documentRepo = require('../repositories/document.repository');
const { DOC_PREFIXES, DOC_COUNTER_KEYS } = require('../../config/constants');

/**
 * Builds the complete document data object by merging:
 * - Company data from DB
 * - Body data from the request
 * - Auto-incremented document number
 *
 * @param {string} userId
 * @param {{ type: string, client: object, items: Array, notes?: string, date?: string }} body
 * @returns {object} docData ready for the PDF template
 */
async function buildDocumentData(userId, body) {
  const { type, client, items = [], notes = '', date, clauses = [], withRetention, withIVA, retentionRate } = body;

  const user = await userRepo.findById(userId);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  const counterKey = DOC_COUNTER_KEYS[type];
  if (!counterKey) throw Object.assign(new Error(`Tipo de documento inválido: ${type}`), { status: 400 });

  // Increment counter atomically in DB
  const counter = await userRepo.incrementCounter(userId, counterKey);
  const prefix  = DOC_PREFIXES[type];
  const docNumber = `${prefix}-${String(counter).padStart(4, '0')}`;

  // Calculate totals
  const subtotal  = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
  const ivaRate   = 19;
  const retRate   = retentionRate ?? 3.5;
  
  const ivaAmount = withIVA ? subtotal * (ivaRate / 100) : 0;
  const retAmount = withRetention ? subtotal * (retRate / 100) : 0;
  const total     = subtotal + ivaAmount + retAmount;

  return {
    // Company
    company: user.company,
    // Document metadata
    docType:   type,
    docNumber,
    date:      date || new Date().toISOString().split('T')[0],
    // Client
    client,
    // Items
    items: items.map((item, idx) => ({
      ...item,
      idx: idx + 1,
      subtotal: item.quantity * item.unitPrice,
    })),
    // Totals
    subtotal,
    ivaRate,
    ivaAmount,
    retRate,
    retAmount,
    total,
    notes,
    clauses,
  };
}

/**
 * Returns the document history for a user.
 */
async function listHistory(userId) {
  return await documentRepo.listByUser(userId);
}

module.exports = { buildDocumentData, listHistory };
