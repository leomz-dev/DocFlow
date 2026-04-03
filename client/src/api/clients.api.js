import api from './http';

export const getClients = async () => {
  const { data } = await api.get('/clients');
  return data;
};

export const createClient = async (clientData) => {
  const { data } = await api.post('/clients', clientData);
  return data;
};

export const updateClient = async (id, clientData) => {
  const { data } = await api.put(`/clients/${id}`, clientData);
  return data;
};

export const deleteClient = async (id) => {
  const { data } = await api.delete(`/clients/${id}`);
  return data;
};
