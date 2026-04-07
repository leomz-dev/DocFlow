const path = require('path');
const documentsService = require('../services/documents.service');
const pdfService       = require('../services/pdf.service');
const documentRepo     = require('../repositories/document.repository');
const storage          = require('../storage/local.storage');

async function generate(req, res, next) {
  try {
    const { type, client, items, notes, date, clauses } = req.body;

    // Build full document data (merges company + body + counter)
    const docData = await documentsService.buildDocumentData(req.user.id, {
      type, client, items, notes, date, clauses,
    });

    // Generate PDF buffer
    const pdfBuffer = await pdfService.generate(type, docData);

    // Save and register in history
    const entry = await pdfService.saveAndRegister(
      req.user.id,
      type,
      docData.docNumber,
      pdfBuffer,
      { title: docData.docNumber, clientName: client?.name, total: docData.total }
    );

    // Respond with PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${entry.number}.pdf"`,
      'X-Doc-Id': entry.id,
      'X-Doc-Number': entry.number,
    });
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const history = await documentsService.listHistory(req.user.id);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const doc = await documentRepo.findDocument(req.user.id, req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    const absPath = storage.getPath(doc.filePath);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${doc.number}.pdf"`);
    res.sendFile(absPath);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const doc = await documentRepo.findDocument(req.user.id, req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    await storage.remove(doc.filePath);
    await documentRepo.deleteDocument(req.user.id, req.params.id);
    res.json({ message: 'Documento eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, getHistory, download, remove };
