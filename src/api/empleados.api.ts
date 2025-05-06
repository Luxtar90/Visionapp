import { client } from './client';

export interface Empleado {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  cargo?: string;
  nivel_estudio?: string;
  activo_para_reservas: boolean;
  foto_url?: string;
  tiendaId?: number | null;
  identificacion?: string;
  fecha_nacimiento?: string;
  color_asignado?: string;
  direccion_pais?: string;
  direccion_ciudad?: string;
  direccion_detalle?: string;
  tipo_contrato?: string;
  nivel_crecimiento?: string;
  fecha_inicio_contrato?: string;
  id_equipo?: number;
  tienda?: any;
}

export const getEmpleados = async (tiendaId?: string): Promise<Empleado[]> => {
  const { data } = await client.get('/empleados', { params: { tiendaId } });
  return data;
};

export const getEmpleadoById = async (id: string): Promise<Empleado> => {
  const { data } = await client.get(`/empleados/${id}`);
  return data;
};

export const createEmpleado = async (dto: Partial<Empleado>): Promise<Empleado> => {
  const { data } = await client.post('/empleados', dto);
  return data;
};

export const updateEmpleado = async (id: string, dto: Partial<Empleado>): Promise<Empleado> => {
  const { data } = await client.patch(`/empleados/${id}`, dto);
  return data;
};

export const deleteEmpleado = async (id: string): Promise<void> => {
  await client.delete(`/empleados/${id}`);
};

export const toggleEmpleadoActivo = async (id: string, activo: boolean): Promise<Empleado> => {
  const { data } = await client.patch(`/empleados/${id}/estado`, { activo_para_reservas: activo });
  return data;
};
