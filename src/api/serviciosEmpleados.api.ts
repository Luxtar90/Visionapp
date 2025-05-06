// src/api/serviciosEmpleados.api.ts
import { client } from './client';

export interface ServicioAsignado {
  id: string;
  empleadoId: string;
  servicioId: string;
  habilitado: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  duracion?: number;
  nivel_habilidad?: number;
  comision_especial?: number;
  notas?: string;
  tienda_id?: string;
  servicio?: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio?: number;
    costo?: number;
    tiempo_estimado?: number;
    categoria?: string;
    imagen?: string;
    tiendaId?: number;
  };
  empleado?: {
    id: string;
    nombres: string;
    apellidos: string;
    cargo?: string;
  };
}

// Interfaz para la respuesta paginada de la API
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Obtener todos los servicios asignados
export const getServiciosAsignados = async (): Promise<ServicioAsignado[]> => {
  try {
    const { data } = await client.get<PaginatedResponse<ServicioAsignado>>('/servicios-asignados-empleado');
    return data.data;
  } catch (error) {
    console.error('Error al obtener servicios asignados:', error);
    throw error;
  }
};

// Obtener servicios asignados a un empleado específico
export const getServiciosPorEmpleado = async (empleadoId: string): Promise<ServicioAsignado[]> => {
  try {
    const { data } = await client.get<PaginatedResponse<ServicioAsignado>>(`/servicios-asignados-empleado`, {
      params: { empleado_id: empleadoId }
    });
    return data.data;
  } catch (error) {
    console.error('Error al obtener servicios del empleado:', error);
    throw error;
  }
};

// Obtener un servicio asignado específico por ID
export const getServicioAsignadoById = async (id: string): Promise<ServicioAsignado> => {
  try {
    const { data } = await client.get<ServicioAsignado>(`/servicios-asignados-empleado/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener servicio asignado:', error);
    throw error;
  }
};

// Asignar un servicio a un empleado
export const asignarServicioAEmpleado = async (datos: {
  empleadoId: string;
  servicioId: string;
  habilitado?: boolean;
  tiendaId?: string;
}): Promise<ServicioAsignado> => {
  try {
    // Transformar los datos al formato que espera el backend
    const datosParaEnviar = {
      empleado_id: parseInt(datos.empleadoId),
      servicio_id: parseInt(datos.servicioId),
      tienda_id: datos.tiendaId ? parseInt(datos.tiendaId) : 1, // Usar tienda por defecto si no se proporciona
      activo: datos.habilitado !== undefined ? datos.habilitado : true
    };
    
    const { data } = await client.post('/servicios-asignados-empleado', datosParaEnviar);
    return data;
  } catch (error) {
    console.error('Error al asignar servicio:', error);
    throw error;
  }
};

// Actualizar un servicio asignado
export const actualizarServicioAsignado = async (
  id: string, 
  datos: Partial<ServicioAsignado>
): Promise<ServicioAsignado> => {
  try {
    // Transformar los datos al formato que espera el backend
    const datosParaEnviar: Record<string, any> = {};
    
    if (datos.empleadoId !== undefined) {
      datosParaEnviar.empleado_id = parseInt(datos.empleadoId);
    }
    
    if (datos.servicioId !== undefined) {
      datosParaEnviar.servicio_id = parseInt(datos.servicioId);
    }
    
    if (datos.habilitado !== undefined) {
      datosParaEnviar.activo = datos.habilitado;
    }
    
    if (datos.tienda_id !== undefined) {
      datosParaEnviar.tienda_id = parseInt(datos.tienda_id);
    }
    
    if (datos.nivel_habilidad !== undefined) {
      datosParaEnviar.nivel_habilidad = datos.nivel_habilidad;
    }
    
    if (datos.comision_especial !== undefined) {
      datosParaEnviar.comision_especial = datos.comision_especial;
    }
    
    if (datos.notas !== undefined) {
      datosParaEnviar.notas = datos.notas;
    }
    
    const { data } = await client.patch(`/servicios-asignados-empleado/${id}`, datosParaEnviar);
    return data;
  } catch (error) {
    console.error('Error al actualizar servicio asignado:', error);
    throw error;
  }
};

// Eliminar un servicio asignado
export const eliminarServicioAsignado = async (id: string): Promise<void> => {
  try {
    await client.delete(`/servicios-asignados-empleado/${id}`);
  } catch (error) {
    console.error('Error al eliminar servicio asignado:', error);
    throw error;
  }
};
