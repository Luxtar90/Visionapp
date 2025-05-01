// src/api/valoraciones.api.ts
import { client } from './client';
import { ValoracionDetallada } from '../types/valoraciones.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaz para los datos de valoración
export interface Valoracion {
  id?: number;
  reservaId: number;
  clienteId: number;
  empleadoId: number;
  servicioId: number;
  valoracion: number;
  comentario: string;
  fecha: string;
}

// Interfaz para la respuesta de promedio de valoraciones
export interface PromedioValoracion {
  promedio: number;
  total: number;
}

// Función auxiliar para verificar el token antes de hacer solicitudes
const ensureAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('@token');
    if (!token) {
      console.error('[valoraciones.api] No se encontró token de autenticación');
      return false;
    }
    return true;
  } catch (error) {
    console.error('[valoraciones.api] Error al verificar autenticación:', error);
    return false;
  }
};

// Obtener todas las valoraciones
export const getValoraciones = async (params?: Record<string, any>): Promise<Valoracion[]> => {
  if (!(await ensureAuthenticated())) {
    return [];
  }
  
  try {
    const { data } = await client.get('/valoraciones', { params });
    return data;
  } catch (error) {
    console.error('Error al obtener valoraciones:', error);
    return [];
  }
};

// Obtener una valoración por ID
export const getValoracionById = async (id: number | string): Promise<Valoracion | null> => {
  if (!(await ensureAuthenticated())) {
    return null;
  }
  
  try {
    const { data } = await client.get(`/valoraciones/${id}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener valoración con ID ${id}:`, error);
    return null;
  }
};

// Crear una nueva valoración
export const createValoracion = async (valoracion: Omit<Valoracion, 'id'>): Promise<Valoracion | null> => {
  if (!(await ensureAuthenticated())) {
    return null;
  }
  
  try {
    const { data } = await client.post('/valoraciones', valoracion);
    return data;
  } catch (error) {
    console.error('Error al crear valoración:', error);
    return null;
  }
};

// Actualizar una valoración existente
export const updateValoracion = async (id: number | string, valoracion: Partial<Valoracion>): Promise<Valoracion | null> => {
  if (!(await ensureAuthenticated())) {
    return null;
  }
  
  try {
    const { data } = await client.patch(`/valoraciones/${id}`, valoracion);
    return data;
  } catch (error) {
    console.error(`Error al actualizar valoración con ID ${id}:`, error);
    return null;
  }
};

// Eliminar una valoración
export const deleteValoracion = async (id: number | string): Promise<boolean> => {
  if (!(await ensureAuthenticated())) {
    return false;
  }
  
  try {
    await client.delete(`/valoraciones/${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar valoración con ID ${id}:`, error);
    return false;
  }
};

// Obtener valoraciones hechas por un cliente
export const getValoracionesByCliente = async (clienteId: number | string): Promise<Valoracion[]> => {
  if (!(await ensureAuthenticated())) {
    return [];
  }
  
  try {
    const { data } = await client.get(`/valoraciones/cliente/${clienteId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener valoraciones del cliente ${clienteId}:`, error);
    return [];
  }
};

// Obtener valoraciones de un empleado
export const getValoracionesByEmpleado = async (empleadoId: number | string): Promise<ValoracionDetallada[]> => {
  if (!(await ensureAuthenticated())) {
    return [];
  }
  
  try {
    const { data } = await client.get(`/valoraciones/empleado/${empleadoId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener valoraciones del empleado ${empleadoId}:`, error);
    throw new Error('Error al obtener valoraciones');
  }
};

// Obtener valoraciones de un empleado para un servicio específico
export const getValoracionesByEmpleadoAndServicio = async (
  empleadoId: number | string,
  servicioId: number | string
): Promise<ValoracionDetallada[]> => {
  if (!(await ensureAuthenticated())) {
    return [];
  }
  
  try {
    const { data } = await client.get(`/valoraciones/empleado/${empleadoId}/servicio/${servicioId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener valoraciones del empleado ${empleadoId} para el servicio ${servicioId}:`, error);
    throw new Error('Error al obtener valoraciones');
  }
};

// Obtener el promedio de valoraciones de un empleado
export const getPromedioValoracionesByEmpleado = async (empleadoId: number | string): Promise<PromedioValoracion | number> => {
  if (!(await ensureAuthenticated())) {
    return 0;
  }
  
  try {
    const { data } = await client.get(`/valoraciones/promedio/empleado/${empleadoId}`);
    
    // Verificar si la respuesta es un número o un objeto con la propiedad promedio
    if (typeof data === 'number') {
      return data;
    } else if (data && typeof data === 'object' && 'promedio' in data) {
      return data as PromedioValoracion;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error al obtener promedio de valoraciones del empleado ${empleadoId}:`, error);
    return 0;
  }
};
