const { Router } = require('express');
const { z } = require('zod');
const controller = require('../controllers/auth.controller');
const validate   = require('../middlewares/validate.middleware');

const router = Router();

const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

router.post('/login',   validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);

module.exports = router;
