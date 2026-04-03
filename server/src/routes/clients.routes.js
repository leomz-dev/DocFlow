const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const clientController = require('../controllers/client.controller');

const router = Router();

router.use(authMiddleware); // requires login

router.get('/', clientController.getAll);
router.get('/:id', clientController.getById);
router.post('/', clientController.create);
router.put('/:id', clientController.update);
router.delete('/:id', clientController.remove);

module.exports = router;
