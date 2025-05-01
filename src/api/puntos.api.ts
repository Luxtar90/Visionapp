// src/api/puntos.api.ts
import { client } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Punto,
  TipoPunto,
  ResumenPuntosCliente,
  ResumenPuntosClienteTienda,
  RegistrarPuntosProductoParams,
  RegistrarPuntosServicioParams,
  CanjearPuntosParams,
  RegistrarPuntosResponse
} from '../types/puntos.types';

// Función auxiliar para verificar el token antes de hacer solicitudes
const ensureAuthenticated = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('@token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  return token;
};

// Obtener el historial de puntos de un cliente
export const getPuntosCliente = async (clienteId: number): Promise<Punto[]> => {
  try {
    const token = await ensureAuthenticated();
    const { data } = await client.get(`/puntos/cliente/${clienteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[puntos.api] Error al obtener puntos del cliente:', error);
    throw error;
  }
};

// Obtener el historial de puntos de un cliente en una tienda específica
export const getPuntosClienteTienda = async (clienteId: number, tiendaId: number): Promise<Punto[]> => {
  try {
    const token = await ensureAuthenticated();
    const { data } = await client.get(`/puntos/cliente/${clienteId}/tienda/${tiendaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[puntos.api] Error al obtener puntos del cliente por tienda:', error);
    throw error;
  }
};

// Obtener resumen de puntos de un cliente
export const getResumenPuntosCliente = async (clienteId: number): Promise<ResumenPuntosCliente> => {
  try {
    const token = await ensureAuthenticated();
    const { data } = await client.get(`/puntos/cliente/${clienteId}/resumen`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[puntos.api] Error al obtener resumen de puntos:', error);
    throw error;
  }
};

// Obtener resumen de puntos de un cliente en una tienda específica
export const getResumenPuntosClienteTienda = async (
  clienteId: number,
  tiendaId: number
): Promise<ResumenPuntosClienteTienda> => {
  try {
    const token = await ensureAuthenticated();
    const { data } = await client.get(`/puntos/cliente/${clienteId}/tienda/${tiendaId}/resumen`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[puntos.api] Error al obtener resumen de puntos por tienda:', error);
    throw error;
  }
};

// Calcular puntos para una compra de producto
export const calcularPuntosProducto = (precioTotal: number): number => {
  // Regla: 1 punto por cada $10 de compra
  return Math.floor(precioTotal / 10);
};

// Calcular puntos para un servicio
export const calcularPuntosServicio = (precioServicio: number): number => {
  // Regla: 2 puntos por cada $10 de servicio
  return Math.floor(precioServicio / 10) * 2;
};

// Registrar puntos por compra de producto
export const registrarPuntosProducto = async (
  params: RegistrarPuntosProductoParams
): Promise<RegistrarPuntosResponse | null> => {
  try {
    const token = await ensureAuthenticated();
    const { data } = await client.post('/puntos/producto', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[puntos.api] Error al registrar puntos por producto:', error);
    throw error;
  }
};

// Registrar puntos por servicio
export const registrarPuntosServicio = async (
  params: RegistrarPuntosServicioParams
): Promise<RegistrarPuntosResponse | null> => {
  try {
    const token = await ensureAuthenticated();
    const { data } = await client.post('/puntos/servicio', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[puntos.api] Error al registrar puntos por servicio:', error);
    throw error;
  }
};

// Canjear puntos
export const canjearPuntos = async (
  params: CanjearPuntosParams
): Promise<Punto | null> => {
  try {
    const token = await ensureAuthenticated();
    const { data } = await client.post('/puntos/canjear', params, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('[puntos.api] Error al canjear puntos:', error);
    throw error;
  }
};
