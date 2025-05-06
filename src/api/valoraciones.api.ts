// src/api/valoraciones.api.ts
import { client } from './client';

// Interfaz para los datos de valoración
export interface Valoracion {
  id: string;
  empleadoId: string;
  clienteId: string;
  reservaId?: string;
  ventaId?: string;
  puntuacion: number;
  comentario?: string;
  fecha: string;
  cliente?: {
    id: string;
    nombres: string;
    apellidos: string;
  };
}

// Interfaz para la respuesta de promedio de valoraciones
export interface PromedioValoracion {
  empleadoId: string;
  promedio: number;
  total: number;
}

// Obtener todas las valoraciones
export const getValoraciones = async (): Promise<Valoracion[]> => {
  try {
    const { data } = await client.get('/valoraciones');
    return data;
  } catch (error) {
    console.error('Error al obtener valoraciones:', error);
    throw error;
  }
};

// Obtener una valoración específica por ID
export const getValoracionById = async (id: string): Promise<Valoracion> => {
  try {
    const { data } = await client.get(`/valoraciones/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener valoración:', error);
    throw error;
  }
};

// Crear una nueva valoración
export const crearValoracion = async (data: Omit<Valoracion, 'id'>): Promise<Valoracion> => {
  try {
    const { data: responseData } = await client.post('/valoraciones', data);
    return responseData;
  } catch (error) {
    console.error('Error al crear valoración:', error);
    throw error;
  }
};

// Actualizar una valoración
export const actualizarValoracion = async (id: string, data: Partial<Valoracion>): Promise<Valoracion> => {
  try {
    const { data: responseData } = await client.patch(`/valoraciones/${id}`, data);
    return responseData;
  } catch (error) {
    console.error('Error al actualizar valoración:', error);
    throw error;
  }
};

// Eliminar una valoración
export const eliminarValoracion = async (id: string): Promise<void> => {
  try {
    await client.delete(`/valoraciones/${id}`);
  } catch (error) {
    console.error('Error al eliminar valoración:', error);
    throw error;
  }
};

// Obtener valoraciones de un empleado específico
export const getValoracionesByEmpleado = async (empleadoId: string): Promise<Valoracion[]> => {
  try {
    const { data } = await client.get(`/valoraciones/empleado/${empleadoId}`);
    return data;
  } catch (error) {
    console.error('Error al obtener valoraciones del empleado:', error);
    throw error;
  }
};

// Obtener promedio de valoraciones por empleado
export const getPromedioValoracionesByEmpleado = async (empleadoId: string): Promise<PromedioValoracion> => {
  try {
    const { data } = await client.get(`/valoraciones/empleado/${empleadoId}/promedio`);
    return data;
  } catch (error) {
    console.error('Error al obtener promedio de valoraciones del empleado:', error);
    throw error;
  }
};
