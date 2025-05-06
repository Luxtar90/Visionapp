import { client } from './client';
import { Tienda } from '../interfaces/Tienda';

// Interfaz para la relación usuario-tienda
export interface UsuarioTiendaRelacion {
  id: number;
  usuarioId: number;
  tiendaId: number;
  es_administrador: boolean;
  fecha_registro: string;
  usuario: {
    id: number;
    nombre_usuario: string;
    email: string;
    rolId: number | null;
    rol: any | null;
    empleado_id: number | null;
    cliente_id: number | null;
  };
  tienda: Tienda;
}

export const getTiendas = async (params?: { activas?: boolean }): Promise<Tienda[]> => {
  const { data } = await client.get('/tiendas', { params });
  return data;
};

export const getTiendaById = async (id: string): Promise<Tienda> => {
  const { data } = await client.get(`/tiendas/${id}`);
  return data;
};

// Obtiene las tiendas asociadas al usuario actual
export const getTiendasByUsuario = async (): Promise<UsuarioTiendaRelacion[]> => {
  const { data } = await client.get('/usuario-tienda');
  return data;
};

export const createTienda = async (tienda: Partial<Tienda>): Promise<Tienda> => {
  const { data } = await client.post('/tiendas', tienda);
  return data;
};

export const updateTienda = async (id: string, tienda: Partial<Tienda>): Promise<Tienda> => {
  const { data } = await client.put(`/tiendas/${id}`, tienda);
  return data;
};

export const deleteTienda = async (id: string): Promise<void> => {
  await client.delete(`/tiendas/${id}`);
};

export const toggleTiendaActiva = async (id: string, activa: boolean): Promise<Tienda> => {
  const { data } = await client.patch(`/tiendas/${id}/estado`, { activa });
  return data;
};

export const buscarTiendas = async (query: string): Promise<Tienda[]> => {
  const { data } = await client.get('/tiendas/buscar', { params: { query } });
  return data;
};
