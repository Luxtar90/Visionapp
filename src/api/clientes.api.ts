import { client } from './client';
import { Cliente } from '../interfaces/Cliente';

export const getClientes = async (tiendaId?: string, params?: { limit?: number; offset?: number }): Promise<Cliente[]> => {
  const queryParams = { ...params, tiendaId };
  const { data } = await client.get('/clientes', { params: queryParams });
  return data;
};

export const getClienteById = async (id: string): Promise<Cliente> => {
  const { data } = await client.get(`/clientes/${id}`);
  return data;
};

export const createCliente = async (dto: Partial<Cliente>): Promise<Cliente> => {
  const { data } = await client.post('/clientes', dto);
  return data;
};

export const updateCliente = async (id: string, dto: Partial<Cliente>): Promise<Cliente> => {
  const { data } = await client.patch(`/clientes/${id}`, dto);
  return data;
};

export const deleteCliente = async (id: string): Promise<void> => {
  await client.delete(`/clientes/${id}`);
};

export const toggleClienteActivo = async (id: string, activo: boolean): Promise<Cliente> => {
  const { data } = await client.patch(`/clientes/${id}/estado`, { activo });
  return data;
};

export const getClienteHistorial = async (id: string): Promise<any[]> => {
  const { data } = await client.get(`/clientes/${id}/historial`);
  return data;
};

export const buscarClientes = async (query: string, tiendaId?: string): Promise<Cliente[]> => {
  const { data } = await client.get('/clientes/buscar', { params: { query, tiendaId } });
  return data;
};
