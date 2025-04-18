import client from './client';

export interface Usuario {
  id: number;
  nombre_usuario: string;
  email: string;
  rol: { id: number; nombre: string };
  empleado_id?: number;
  cliente_id?: number;
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
