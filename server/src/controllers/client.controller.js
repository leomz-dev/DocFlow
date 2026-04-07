const clientService = require('../services/client.service');

async function getAll(req, res, next) {
  try {
    // Note: We use req.user.id for multi-tenancy support
    const data = await clientService.getAllClients(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await clientService.getClientById(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    // Note: Inject creator userId
    const data = await clientService.createClient({ ...req.body, userId: req.user.id });
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await clientService.updateClient(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await clientService.deleteClient(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
