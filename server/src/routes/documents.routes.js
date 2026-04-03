const { Router } = require('express');
const { z } = require('zod');
const controller = require('../controllers/documents.controller');
const auth       = require('../middlewares/auth.middleware');
const validate   = require('../middlewares/validate.middleware');

const router = Router();

const itemSchema = z.object({
  description: z.string().min(1),
  quantity:    z.number().positive(),
  unitPrice:   z.number().nonnegative(),
});

const clientSchema = z.object({
  name:    z.string().min(1, 'Nombre del cliente requerido'),
  nit:     z.string().optional(),
  address: z.string().optional(),
  email:   z.string().email().optional().or(z.literal('')),
  phone:   z.string().optional(),
  city:    z.string().optional(),
});

const clauseSchema = z.object({
  title:   z.string().min(1),
  content: z.string().min(1),
});

const generateSchema = z.object({
  type:    z.enum(['cuenta-cobro', 'cotizacion', 'contrato']),
  client:  clientSchema,
  items:   z.array(itemSchema).min(1, 'Se requiere al menos un ítem'),
  clauses: z.array(clauseSchema).optional(),
  notes:   z.string().optional(),
  date:    z.string().optional(),
});

router.post('/generate',          auth, validate(generateSchema), controller.generate);
router.get( '/history',           auth, controller.getHistory);
router.get( '/:id/download',      auth, controller.download);
router.delete('/:id',             auth, controller.remove);

module.exports = router;
