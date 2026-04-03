const clientService = require('../services/client.service');

function getAll(req, res) {
  try {
    const data = clientService.getAllClients();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function getById(req, res) {
  try {
    const data = clientService.getClientById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

function create(req, res) {
  try {
    const data = clientService.createClient(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

function update(req, res) {
  try {
    const data = clientService.updateClient(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

function remove(req, res) {
  try {
    clientService.deleteClient(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { getAll, getById, create, update, remove };
