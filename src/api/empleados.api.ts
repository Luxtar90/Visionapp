import { client } from './client';

export interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
  foto_url?: string;
  tienda_id?: string;
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
  const { data } = await client.patch(`/empleados/${id}/estado`, { activo });
  return data;
};
