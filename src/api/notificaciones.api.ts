// src/api/notificaciones.api.ts
import { client } from './client';
import { 
  Notificacion, 
  NotificacionUsuario, 
  FiltrosNotificaciones 
} from '../interfaces/Notificacion';

/**
 * Obtiene todas las notificaciones de una tienda con filtros opcionales
 */
export const getNotificaciones = async (
  tiendaId: string,
  filtros?: FiltrosNotificaciones
): Promise<Notificacion[]> => {
  const params = { ...filtros, tienda_id: tiendaId };
  const { data } = await client.get('/notificaciones', { params });
  return data;
};

/**
 * Obtiene una notificación por su ID
 */
export const getNotificacionById = async (id: string): Promise<Notificacion> => {
  const { data } = await client.get(`/notificaciones/${id}`);
  return data;
};

/**
 * Crea una nueva notificación
 */
export const createNotificacion = async (notificacion: Partial<Notificacion>): Promise<Notificacion> => {
  const { data } = await client.post('/notificaciones', notificacion);
  return data;
};

/**
 * Actualiza una notificación existente
 */
export const updateNotificacion = async (
  id: string,
  notificacion: Partial<Notificacion>
): Promise<Notificacion> => {
  const { data } = await client.put(`/notificaciones/${id}`, notificacion);
  return data;
};

/**
 * Elimina una notificación
 */
export const deleteNotificacion = async (id: string): Promise<void> => {
  await client.delete(`/notificaciones/${id}`);
};

/**
 * Envía una notificación inmediatamente
 */
export const enviarNotificacion = async (id: string): Promise<Notificacion> => {
  const { data } = await client.post(`/notificaciones/${id}/enviar`);
  return data;
};

/**
 * Cancela una notificación programada
 */
export const cancelarNotificacion = async (id: string): Promise<Notificacion> => {
  const { data } = await client.post(`/notificaciones/${id}/cancelar`);
  return data;
};

/**
 * Obtiene las notificaciones de un usuario específico
 */
export const getNotificacionesUsuario = async (
  usuarioId: string,
  estado?: 'no_leida' | 'leida' | 'todas'
): Promise<NotificacionUsuario[]> => {
  const params = { estado };
  const { data } = await client.get(`/usuarios/${usuarioId}/notificaciones`, { params });
  return data;
};

/**
 * Marca una notificación como leída para un usuario
 */
export const marcarNotificacionLeida = async (
  usuarioId: string,
  notificacionId: string
): Promise<NotificacionUsuario> => {
  const { data } = await client.put(`/usuarios/${usuarioId}/notificaciones/${notificacionId}/leer`);
  return data;
};

/**
 * Marca todas las notificaciones como leídas para un usuario
 */
export const marcarTodasLeidas = async (usuarioId: string): Promise<void> => {
  await client.put(`/usuarios/${usuarioId}/notificaciones/leer-todas`);
};

/**
 * Elimina una notificación para un usuario
 */
export const eliminarNotificacionUsuario = async (
  usuarioId: string,
  notificacionId: string
): Promise<void> => {
  await client.delete(`/usuarios/${usuarioId}/notificaciones/${notificacionId}`);
};

/**
 * Obtiene estadísticas de notificaciones
 */
export const getEstadisticasNotificaciones = async (
  tiendaId: string,
  filtros?: FiltrosNotificaciones
): Promise<{
  total: number;
  pendientes: number;
  enviadas: number;
  leidas: number;
  tasa_apertura: number;
}> => {
  const params = { ...filtros, tienda_id: tiendaId };
  const { data } = await client.get('/notificaciones/estadisticas', { params });
  return data;
};
