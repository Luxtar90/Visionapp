import { client } from './client';
import { Servicio } from '../interfaces/Servicio';

export const getServicios = async (tiendaId?: string): Promise<Servicio[]> => {
  const { data } = await client.get('/servicios', { params: { tiendaId } });
  return data;
};

export const getServicioById = async (id: string): Promise<Servicio> => {
  const { data } = await client.get(`/servicios/${id}`);
  return data;
};

export const createServicio = async (dto: Partial<Servicio>): Promise<Servicio> => {
  const { data } = await client.post('/servicios', dto);
  return data;
};

export const updateServicio = async (id: string, dto: Partial<Servicio>): Promise<Servicio> => {
  const { data } = await client.patch(`/servicios/${id}`, dto);
  return data;
};

export const deleteServicio = async (id: string): Promise<void> => {
  await client.delete(`/servicios/${id}`);
};

export const toggleServicioActivo = async (id: string, activo: boolean): Promise<Servicio> => {
  const { data } = await client.patch(`/servicios/${id}/estado`, { activo });
  return data;
};

export const getServiciosPorCategoria = async (categoria: string, tiendaId?: string): Promise<Servicio[]> => {
  const { data } = await client.get('/servicios', { params: { categoria, tiendaId } });
  return data;
};
