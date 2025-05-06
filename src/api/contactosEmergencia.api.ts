// src/api/contactosEmergencia.api.ts
import { client } from './client';

export interface ContactoEmergencia {
  id: string;
  empleadoId: string;
  nombre: string;
  relacion: string;
  telefono: string;
  email?: string;
  es_principal: boolean;
}

// Obtener todos los contactos de emergencia
export const getContactosEmergencia = async (): Promise<ContactoEmergencia[]> => {
  try {
    const { data } = await client.get('/contactos-emergencia');
    return data;
  } catch (error) {
    console.error('Error al obtener contactos de emergencia:', error);
    throw error;
  }
};

// Obtener contactos de emergencia de un empleado específico
export const getContactosEmergenciaPorEmpleado = async (empleadoId: string): Promise<ContactoEmergencia[]> => {
  try {
    const { data } = await client.get(`/contactos-emergencia/empleado/${empleadoId}`);
    return data;
  } catch (error) {
    console.error('Error al obtener contactos de emergencia del empleado:', error);
    throw error;
  }
};

// Obtener un contacto de emergencia específico por ID
export const getContactoEmergenciaById = async (id: string): Promise<ContactoEmergencia> => {
  try {
    const { data } = await client.get(`/contactos-emergencia/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener contacto de emergencia:', error);
    throw error;
  }
};

// Crear un nuevo contacto de emergencia
export const crearContactoEmergencia = async (data: Omit<ContactoEmergencia, 'id'>): Promise<ContactoEmergencia> => {
  try {
    const { data: responseData } = await client.post('/contactos-emergencia', data);
    return responseData;
  } catch (error) {
    console.error('Error al crear contacto de emergencia:', error);
    throw error;
  }
};

// Actualizar un contacto de emergencia
export const actualizarContactoEmergencia = async (id: string, data: Partial<ContactoEmergencia>): Promise<ContactoEmergencia> => {
  try {
    const { data: responseData } = await client.patch(`/contactos-emergencia/${id}`, data);
    return responseData;
  } catch (error) {
    console.error('Error al actualizar contacto de emergencia:', error);
    throw error;
  }
};

// Eliminar un contacto de emergencia
export const eliminarContactoEmergencia = async (id: string): Promise<void> => {
  try {
    await client.delete(`/contactos-emergencia/${id}`);
  } catch (error) {
    console.error('Error al eliminar contacto de emergencia:', error);
    throw error;
  }
};
