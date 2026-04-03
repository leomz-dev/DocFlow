const { Router } = require('express');
const multer     = require('multer');
const controller = require('../controllers/users.controller');
const auth       = require('../middlewares/auth.middleware');

const router  = Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get( '/me',       auth, controller.getMe);
router.put( '/me',       auth, controller.updateMe);
router.post('/me/logo',  auth, upload.single('file'), controller.uploadLogo);
router.post('/me/sign',  auth, upload.single('file'), controller.uploadSign);

module.exports = router;
