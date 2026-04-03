import { useState, useEffect, useCallback } from 'react';
import { getClients, createClient, updateClient, deleteClient } from '@/api/clients.api';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = async (clientData) => {
    try {
      const newClient = await createClient(clientData);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Error al crear cliente');
    }
  };

  const editClient = async (id, clientData) => {
    try {
      const updatedClient = await updateClient(id, clientData);
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      return updatedClient;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Error al actualizar cliente');
    }
  };

  const removeClient = async (id) => {
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Error al eliminar cliente');
    }
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    editClient,
    removeClient
  };
}
