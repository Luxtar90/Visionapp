import { client } from './client';
import { Cliente } from '../interfaces/Cliente';

export const getClientes = async (tiendaId?: string, params?: { limit?: number; offset?: number }): Promise<Cliente[]> => {
  try {
    console.log('API getClientes - Solicitando clientes para tienda:', tiendaId);
    const queryParams: Record<string, any> = { ...params };
    
    // Asegurarse de que tiendaId sea un parámetro válido
    if (tiendaId && tiendaId.trim() !== '') {
      // Usar tienda_id como parámetro para filtrar por tienda
      queryParams.tienda_id = tiendaId;
    }
    
    console.log('API getClientes - Parámetros de consulta:', queryParams);
    const response = await client.get('/clientes', { params: queryParams });
    
    // La API devuelve un objeto con la estructura { data: [...], total, limit, offset }
    let clientes = response.data?.data || [];
    
    // Filtrar solo los clientes que tienen tiendaId (están asignados a una tienda)
    if (tiendaId && tiendaId.trim() !== '') {
      clientes = clientes.filter((cliente: Cliente) => cliente.tiendaId !== null);
    }
    
    console.log('API getClientes - Clientes recibidos:', clientes.length);
    return clientes;
  } catch (error) {
    console.error('API getClientes - Error al obtener clientes:', error);
    throw error;
  }
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
  try {
    console.log('API buscarClientes - Buscando clientes con query:', query, 'y tienda:', tiendaId);
    
    const params: Record<string, any> = { query };
    
    // Asegurarse de que tiendaId sea un parámetro válido
    if (tiendaId && tiendaId.trim() !== '') {
      // Usar tienda_id como parámetro para filtrar por tienda
      params.tienda_id = tiendaId;
    }
    
    console.log('API buscarClientes - Parámetros de consulta:', params);
    const response = await client.get('/clientes/buscar', { params });
    
    // La API devuelve un objeto con la estructura { data: [...], total, limit, offset }
    let clientes = response.data?.data || [];
    
    // Filtrar solo los clientes que tienen tiendaId (están asignados a la tienda)
    if (tiendaId && tiendaId.trim() !== '') {
      clientes = clientes.filter((cliente: Cliente) => cliente.tiendaId !== null);
    }
    
    console.log('API buscarClientes - Clientes encontrados:', clientes.length);
    return clientes;
  } catch (error) {
    console.error('API buscarClientes - Error al buscar clientes:', error);
    // En caso de error, devolver un array vacío para evitar que la aplicación se rompa
    return [];
  }
};
