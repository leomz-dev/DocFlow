const usersService = require('../services/users.service');

async function getMe(req, res, next) {
  try {
    const user = usersService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const updated = usersService.updateCompany(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function uploadLogo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const result = await usersService.uploadLogo(req.user.id, req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function uploadSign(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
    const result = await usersService.uploadSign(req.user.id, req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, uploadLogo, uploadSign };
