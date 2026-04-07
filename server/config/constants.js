const path = require('path');

module.exports = {
  BASE_UPLOAD_PATH: path.resolve(__dirname, '../data/uploads'),

  IVA_DEFAULT: 19,
  RETENCION_DEFAULT: 3.5,

  DOC_TYPES: ['cuenta-cobro', 'cotizacion', 'contrato'],

  DOC_PREFIXES: {
    'cuenta-cobro': 'CC',
    'cotizacion': 'COT',
    'contrato': 'CTR',
  },

  DOC_COUNTER_KEYS: {
    'cuenta-cobro': 'cuentaCobro',
    'cotizacion': 'cotizacion',
    'contrato': 'contrato',
  },
};
