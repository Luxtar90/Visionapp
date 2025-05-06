// src/api/comisionesEmpleado.api.ts
import { client } from './client';

export interface ComisionEmpleado {
  id: string;
  empleadoId: number;
  tipo_aplicacion: 'porcentaje' | 'monto_fijo';
  aplica_a: 'servicios' | 'servicio';
  valor: string | number;
  servicioId?: number;
  // Campos adicionales usados en el frontend pero no en el backend
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
  servicio?: {
    id: string;
    nombre: string;
  };
  empleado?: {
    id: number;
    nombres: string;
    apellidos: string;
    // Otros campos del empleado...
  };
}

// Obtener todas las comisiones de empleados
export const getComisionesEmpleado = async (): Promise<ComisionEmpleado[]> => {
  try {
    const { data } = await client.get('/comisiones-empleado');
    return data;
  } catch (error) {
    console.error('Error al obtener comisiones de empleados:', error);
    throw error;
  }
};

// Obtener comisiones de un empleado específico
export const getComisionesPorEmpleado = async (empleadoId: string): Promise<ComisionEmpleado[]> => {
  try {
    // Usar el endpoint correcto con parámetro de consulta en lugar de parámetro de ruta
    const { data } = await client.get(`/comisiones-empleado?empleadoId=${empleadoId}`);
    return data;
  } catch (error) {
    console.error('Error al obtener comisiones del empleado:', error);
    throw error;
  }
};

// Obtener una comisión específica por ID
export const getComisionById = async (id: string): Promise<ComisionEmpleado> => {
  try {
    const { data } = await client.get(`/comisiones-empleado/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener comisión:', error);
    throw error;
  }
};

// Crear una nueva comisión para un empleado
export const crearComision = async (data: Partial<ComisionEmpleado>): Promise<ComisionEmpleado> => {
  try {
    // Asegurarnos de que los datos estén en el formato correcto
    const datosParaEnviar = {
      empleadoId: typeof data.empleadoId === 'string' ? parseInt(data.empleadoId as string) : data.empleadoId,
      tipo_aplicacion: data.tipo_aplicacion || 'porcentaje',
      aplica_a: data.aplica_a || 'servicios',
      valor: data.valor
    };
    
    // Si hay un servicio específico, incluirlo
    if (data.servicioId) {
      // @ts-ignore
      datosParaEnviar.servicioId = typeof data.servicioId === 'string' ? parseInt(data.servicioId) : data.servicioId;
    }
    
    console.log('Enviando datos de comisión:', datosParaEnviar);
    
    const response = await client.post('/comisiones-empleado', datosParaEnviar);
    return response.data;
  } catch (error) {
    console.error('Error al crear comisión:', error);
    throw error;
  }
};

// Actualizar una comisión
export const actualizarComision = async (id: string, data: Partial<ComisionEmpleado>): Promise<ComisionEmpleado> => {
  try {
    const response = await client.patch(`/comisiones-empleado/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar comisión:', error);
    throw error;
  }
};

// Eliminar una comisión
export const eliminarComision = async (id: string): Promise<void> => {
  try {
    await client.delete(`/comisiones-empleado/${id}`);
  } catch (error) {
    console.error('Error al eliminar comisión:', error);
    throw error;
  }
};
