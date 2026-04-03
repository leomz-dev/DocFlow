/**
 * Formats a number as Colombian Peso currency string.
 * @param {number} amount
 * @returns {string}  e.g. "$ 1.500.000"
 */
function formatCOP(amount) {
  if (amount === null || amount === undefined) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Converts a number to Spanish words (for use in contracts/payment docs).
 * Supports numbers up to 999,999,999.
 * @param {number} amount
 * @returns {string}  e.g. "UN MILLÓN QUINIENTOS MIL PESOS M/CTE"
 */
function toWords(amount) {
  const n = Math.floor(amount);
  if (n === 0) return 'CERO PESOS M/CTE';

  const ones = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
                 'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS',
                 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA',
                'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
                    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function chunk(n) {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    let result = '';
    result += hundreds[Math.floor(n / 100)] ? hundreds[Math.floor(n / 100)] + ' ' : '';
    const rem = n % 100;
    if (rem < 20) {
      result += ones[rem];
    } else {
      result += tens[Math.floor(rem / 10)];
      if (rem % 10) result += ' Y ' + ones[rem % 10];
    }
    return result.trim();
  }

  let result = '';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;

  if (millions) result += (millions === 1 ? 'UN MILLÓN' : chunk(millions) + ' MILLONES') + ' ';
  if (thousands) result += (thousands === 1 ? 'MIL' : chunk(thousands) + ' MIL') + ' ';
  if (remainder) result += chunk(remainder);

  return result.trim() + ' PESOS M/CTE';
}

module.exports = { formatCOP, toWords };
