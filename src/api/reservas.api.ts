import { client } from './client';
import { Reserva } from '../interfaces/Reserva';

export const getReservas = async (params?: Record<string, any>): Promise<Reserva[]> => {
  const { data } = await client.get('/reservas', { params });
  return data;
};

export const getReservasCompletas = async (params?: Record<string, any>): Promise<Reserva[]> => {
  const { data } = await client.get('/reservas/completas', { params });
  return data;
};

export const getReservaById = async (id: number | string): Promise<Reserva> => {
  const { data } = await client.get(`/reservas/${id}`);
  return data;
};

export const getReservaCompletaById = async (id: number | string): Promise<Reserva> => {
  const { data } = await client.get(`/reservas/${id}/completa`);
  return data;
};

export const createReserva = async (dto: Partial<Reserva>): Promise<Reserva> => {
  const { data } = await client.post('/reservas', dto);
  return data;
};

export const updateReserva = async (id: number | string, dto: Partial<Reserva>): Promise<Reserva> => {
  const { data } = await client.patch(`/reservas/${id}`, dto);
  return data;
};

export const cambiarEstadoReserva = async (id: number | string, estado: string): Promise<Reserva> => {
  const { data } = await client.patch(`/reservas/${id}/estado`, { estado });
  return data;
};

export const deleteReserva = async (id: number | string): Promise<void> => {
  await client.delete(`/reservas/${id}`);
};
