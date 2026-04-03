/**
 * Formats an ISO date string as dd/mm/yyyy.
 * @param {string} iso
 * @returns {string}
 */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('es-CO', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
    timeZone: 'America/Bogota',
  });
}

/**
 * Formats an ISO date string in long Spanish format.
 * @param {string} iso
 * @returns {string}  e.g. "28 de marzo de 2026"
 */
function formatDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('es-CO', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
    timeZone: 'America/Bogota',
  });
}

/**
 * Returns today's date as yyyy-mm-dd (Colombian timezone).
 */
function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

module.exports = { formatDate, formatDateLong, today };
