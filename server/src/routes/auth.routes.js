const { Router } = require('express');
const controller = require('../controllers/auth.controller');

const router = Router();

// Google OAuth login / auto-register
router.post('/google', controller.googleLogin);

module.exports = router;
