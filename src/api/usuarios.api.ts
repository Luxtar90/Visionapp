import { client } from './client';

export interface Usuario {
  id: number;
  nombre_usuario: string;
  email: string;
  rol: { id: number; nombre: string };
  empleado_id?: number;
  cliente_id?: number;
}

export interface ConvertirClienteEmpleadoDto {
  sucursal_id: number;
  cargo?: string;
  tipo_contrato?: string;
  color_asignado?: string;
  activo_para_reservas?: boolean;
  mantener_cliente?: boolean;
  forzar_actualizacion?: boolean;
}

export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data } = await client.get('/usuarios');
  return data;
};

export const getUsuario = async (id: number): Promise<Usuario> => {
  const { data } = await client.get(`/usuarios/${id}`);
  return data;
};

export const updateUsuario = async (id: number, dto: Partial<Usuario>): Promise<Usuario> => {
  const { data } = await client.patch(`/usuarios/${id}`, dto);
  return data;
};

export const getUsuarioPorClienteId = async (clienteId: number): Promise<Usuario | null> => {
  try {
    // Usar el endpoint que obtiene directamente el usuario por ID de cliente
    const { data } = await client.get(`/usuarios/cliente/${clienteId}`);
    return data;
  } catch (error) {
    console.error('Error al buscar usuario por cliente_id:', error);
    return null;
  }
};

export const getUsuarioPorEmpleadoId = async (empleadoId: number): Promise<Usuario | null> => {
  try {
    // Usar el endpoint que obtiene directamente el usuario por ID de empleado
    const { data } = await client.get(`/usuarios/empleado/${empleadoId}`);
    return data;
  } catch (error) {
    console.error('Error al buscar usuario por empleado_id:', error);
    return null;
  }
};

export const convertirClienteAEmpleado = async (
  usuarioId: number, 
  dto: ConvertirClienteEmpleadoDto
): Promise<Usuario> => {
  const { data } = await client.post(`/usuarios/${usuarioId}/convertir-a-empleado`, dto);
  return data;
};
